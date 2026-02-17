(function () {
  const CONFIG = {
    apiEndpoint: "https://nico-ruge.netlify.app/.netlify/functions/spotify",
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

  async function fetchStatus() {
    try {
      const res = await fetch(CONFIG.apiEndpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      lastFetchAt = Date.now();
      renderTrack(json);
    } catch (_error) {
      if (!currentData) {
        renderEmpty();
      }
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
      if (spotify) {
        stopPolling();
        lastFetchAt = Date.now();
        renderTrack(mapLanyardSpotify(spotify));
        return;
      }

      startPolling();
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

  connectWebhook();

  setTimeout(() => {
    if (!webhookReady) {
      startPolling();
    }
  }, CONFIG.initialFallbackMs);

  setInterval(tickProgress, CONFIG.tickIntervalMs);
})();
