(function () {
  const CONFIG = {
    apiEndpoints: ["/.netlify/functions/spotify", "https://nico-ruge.netlify.app/.netlify/functions/spotify"],
    targetId: "spotify-sidebar-widget",
    fetchIntervalMs: 20000,
    tickIntervalMs: 1000,
    websocketUrl: "wss://api.lanyard.rest/socket",
    discordId: "269810872619237378",
    reconnectMs: 5000,
    initialFallbackMs: 6000
  };

  let currentData = null;
  let lastFetchAt = 0;
  let pollIntervalId = null;
  let socket = null;
  let heartbeatIntervalId = null;
  let webhookReady = false;

  function safe(value) {
    return String(value == null ? "" : value);
  }

  function formatTime(ms) {
    const totalSeconds = Math.max(0, Math.floor((ms || 0) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  function getProgressState(data) {
    const item = data?.item;
    const durationMs = item?.duration_ms || 0;
    let progressMs = data?.progress_ms || 0;

    if (data?.isPlaying) {
      progressMs += Date.now() - lastFetchAt;
    }

    progressMs = Math.min(Math.max(progressMs, 0), durationMs || progressMs);
    const percent = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;

    return { progressMs, durationMs, percent };
  }

  function renderEmpty() {
    const container = document.getElementById(CONFIG.targetId);
    if (!container) return;

    container.innerHTML = `
      <div class="sidebar-now-playing-label">Last played on Spotify</div>
      <div class="sidebar-now-playing-meta">Nothing played recently.</div>
    `;
  }

  function renderError(message) {
    const container = document.getElementById(CONFIG.targetId);
    if (!container) return;
    container.innerHTML = `
      <div class="sidebar-now-playing-label">Last played on Spotify</div>
      <div class="sidebar-now-playing-meta">${safe(message || "Spotify status unavailable.")}</div>
    `;
  }

  function renderTrack(data, { keepData = false } = {}) {
    const container = document.getElementById(CONFIG.targetId);
    if (!container) return;

    if (!data || !data.item) {
      if (!keepData) currentData = null;
      renderEmpty();
      return;
    }

    if (!keepData) currentData = data;

    const item = data.item;
    const isEpisode = item.type === "episode";
    const title = safe(item.name || "Unknown title");

    const artist = isEpisode
      ? safe(item.show?.publisher || item.show?.name || "Podcast")
      : safe((item.artists || []).map((a) => a.name).join(", ") || "Unknown artist");

    const coverUrl = isEpisode
      ? safe(item.images?.[0]?.url || item.show?.images?.[0]?.url || "")
      : safe(item.album?.images?.[0]?.url || "");

    const trackUrl = safe(item.external_urls?.spotify || "https://open.spotify.com/");
    const label = data.isPlaying ? "I'm currently listening to" : "I last listened to";
    const labelClass = data.isPlaying ? "sidebar-now-playing-label is-playing" : "sidebar-now-playing-label";
    const { progressMs, durationMs, percent } = getProgressState(data);

    container.innerHTML = `
      <div class="${labelClass}">${label}</div>
      <div class="sidebar-now-playing-row">
        ${coverUrl ? `<img src="${coverUrl}" alt="${title}" class="sidebar-now-playing-cover">` : ""}
        <div class="sidebar-now-playing-info">
          <a href="${trackUrl}" target="_blank" rel="noopener noreferrer" class="sidebar-now-playing-title">${title}</a>
          <div class="sidebar-now-playing-meta">${artist}</div>
        </div>
      </div>
      <div class="sidebar-now-playing-progress-wrap ${data.isPlaying ? "" : "is-idle"}">
        <div class="sidebar-now-playing-progress">
          <div class="sidebar-now-playing-progress-fill" style="width: ${percent}%"></div>
        </div>
        <div class="sidebar-now-playing-time">${formatTime(progressMs)} / ${formatTime(durationMs)}</div>
      </div>
    `;
  }

  function mapLanyardSpotify(spotify) {
    return {
      isPlaying: true,
      progress_ms: Date.now() - spotify.timestamps.start,
      item: {
        id: spotify.track_id,
        name: spotify.song,
        duration_ms: spotify.timestamps.end - spotify.timestamps.start,
        type: "track",
        artists: spotify.artist.split("; ").map((name) => ({ name })),
        album: {
          name: spotify.album,
          images: [{ url: spotify.album_art_url }]
        },
        external_urls: {
          spotify: `https://open.spotify.com/track/${spotify.track_id}`
        }
      }
    };
  }

  function pauseCurrentTrack() {
    if (!currentData?.item) return;
    const { progressMs } = getProgressState(currentData);
    currentData = {
      ...currentData,
      isPlaying: false,
      progress_ms: progressMs
    };
    lastFetchAt = Date.now();
    renderTrack(currentData, { keepData: true });
  }

  function mapTrackLike(track, { isPlaying = false, progressMs = 0 } = {}) {
    if (!track) return null;

    // Spotify recently-played responses usually wrap the playable item in `track`.
    const item = track.track || track.item || track;
    if (!item?.name) return null;

    return {
      isPlaying: Boolean(isPlaying),
      progress_ms: progressMs || 0,
      item
    };
  }

  function normalizeStatusPayload(payload) {
    if (!payload) return null;

    if (typeof payload.body === "string") {
      try {
        const parsedBody = JSON.parse(payload.body);
        const normalizedBody = normalizeStatusPayload(parsedBody);
        if (normalizedBody) return normalizedBody;
      } catch (_error) {
        // Ignore invalid body wrapper and keep matching other shapes.
      }
    }

    if (payload.data) {
      const normalizedNested = normalizeStatusPayload(payload.data);
      if (normalizedNested) return normalizedNested;
    }

    if (payload.item) {
      const normalizedItem = mapTrackLike(payload, {
        isPlaying: payload.isPlaying ?? payload.is_playing,
        progressMs: payload.progress_ms
      });
      if (normalizedItem) return normalizedItem;
    }

    if (payload.track) {
      const normalizedTrack = mapTrackLike(payload, {
        isPlaying: payload.isPlaying ?? payload.is_playing,
        progressMs: payload.progress_ms
      });
      if (normalizedTrack) return normalizedTrack;
    }

    if (Array.isArray(payload.items) && payload.items.length) {
      return mapTrackLike(payload.items[0]);
    }

    if (Array.isArray(payload.recently_played) && payload.recently_played.length) {
      return mapTrackLike(payload.recently_played[0]);
    }

    if (Array.isArray(payload.recentlyPlayed) && payload.recentlyPlayed.length) {
      return mapTrackLike(payload.recentlyPlayed[0]);
    }

    if (Array.isArray(payload.recently_played?.items) && payload.recently_played.items.length) {
      return mapTrackLike(payload.recently_played.items[0]);
    }

    if (Array.isArray(payload.recentlyPlayed?.items) && payload.recentlyPlayed.items.length) {
      return mapTrackLike(payload.recentlyPlayed.items[0]);
    }

    if (payload.recently_played?.track || payload.recently_played?.item) {
      return mapTrackLike(payload.recently_played);
    }

    if (payload.recentlyPlayed?.track || payload.lastPlayed?.track || payload.lastPlayed?.item) {
      return mapTrackLike(payload.recentlyPlayed || payload.lastPlayed);
    }

    if (payload.last_played?.track || payload.last_played?.item) {
      return mapTrackLike(payload.last_played);
    }

    if (payload.lastTrack?.track || payload.lastTrack?.item || payload.last_track?.track || payload.last_track?.item) {
      return mapTrackLike(payload.lastTrack || payload.last_track);
    }

    if (payload.song || payload.title) {
      return {
        isPlaying: Boolean(payload.isPlaying ?? payload.is_playing),
        progress_ms: payload.progress_ms || 0,
        item: {
          name: payload.song || payload.title,
          type: payload.type || "track",
          duration_ms: payload.duration_ms || 0,
          artists: String(payload.artist || payload.artists || "Unknown artist")
            .split(/,\s*|;\s*/)
            .filter(Boolean)
            .map((name) => ({ name })),
          album: {
            name: payload.album || "",
            images: [{ url: payload.albumArtUrl || payload.albumImageUrl || "" }]
          },
          external_urls: {
            spotify: payload.songUrl || payload.trackUrl || "https://open.spotify.com/"
          }
        }
      };
    }

    return null;
  }

  async function fetchStatus() {
    for (const endpoint of CONFIG.apiEndpoints) {
      try {
        const res = await fetch(endpoint);

        const text = await res.text();
        if (!text) continue;

        let json;
        try {
          json = JSON.parse(text);
        } catch (_error) {
          continue;
        }

        if (!res.ok) {
          const errorText = json?.detail || json?.error || `Spotify endpoint error (${res.status})`;
          if (!currentData) {
            renderError(errorText);
          }
          continue;
        }

        const normalized = normalizeStatusPayload(json);
        if (!normalized) continue;

        lastFetchAt = Date.now();
        renderTrack(normalized);
        return;
      } catch (_error) {
        // Try the next endpoint.
      }
    }

    if (!currentData) {
      renderEmpty();
    }
  }

  function startPolling() {
    if (pollIntervalId) return;
    fetchStatus();
    pollIntervalId = setInterval(fetchStatus, CONFIG.fetchIntervalMs);
  }

  function stopPolling() {
    if (!pollIntervalId) return;
    clearInterval(pollIntervalId);
    pollIntervalId = null;
  }

  function stopHeartbeat() {
    if (!heartbeatIntervalId) return;
    clearInterval(heartbeatIntervalId);
    heartbeatIntervalId = null;
  }

  function connectWebhook() {
    socket = new WebSocket(CONFIG.websocketUrl);

    socket.onmessage = (event) => {
      let payload;
      try {
        payload = JSON.parse(event.data);
      } catch (_error) {
        return;
      }

      const { op, d, t } = payload;

      if (op === 1) {
        stopHeartbeat();
        heartbeatIntervalId = setInterval(() => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ op: 3 }));
          }
        }, d.heartbeat_interval);

        socket.send(
          JSON.stringify({
            op: 2,
            d: { subscribe_to_id: CONFIG.discordId }
          })
        );
        return;
      }

      if (op !== 0) return;
      if (t !== "INIT_STATE" && t !== "PRESENCE_UPDATE") return;

      webhookReady = true;
      const spotify = d?.spotify;
      const listeningToSpotify = Boolean(d?.listening_to_spotify);
      if (spotify && listeningToSpotify) {
        stopPolling();
        lastFetchAt = Date.now();
        renderTrack(mapLanyardSpotify(spotify));
        return;
      }

      pauseCurrentTrack();
      startPolling();
      fetchStatus();
    };

    socket.onclose = () => {
      webhookReady = false;
      stopHeartbeat();
      startPolling();
      setTimeout(connectWebhook, CONFIG.reconnectMs);
    };

    socket.onerror = () => {
      if (socket) socket.close();
    };
  }

  function tickProgress() {
    if (!currentData || !currentData.item) return;
    renderTrack(currentData, { keepData: true });
  }

  window.updateSpotifyWidget = (spotify, listeningToSpotify = true) => {
    webhookReady = true;
    if (spotify && listeningToSpotify) {
      stopPolling();
      lastFetchAt = Date.now();
      renderTrack(mapLanyardSpotify(spotify));
      return;
    }

    pauseCurrentTrack();
    startPolling();
    fetchStatus();
  };

  connectWebhook();

  setTimeout(() => {
    if (!webhookReady) {
      startPolling();
    }
  }, CONFIG.initialFallbackMs);

  setInterval(tickProgress, CONFIG.tickIntervalMs);
})();
