(function () {
  const CONFIG = {
    apiEndpoint: "https://nico-ruge.netlify.app/.netlify/functions/spotify",
    targetId: "spotify-widget",
    fetchIntervalMs: 10000,
    updateIntervalMs: 1000,
    classPrefix: "sp-"
  };

  const $ = (sel) => document.querySelector(sel);

  let currentState = {
    data: null,
    lastFetchTime: 0,
    currentTrackSignature: null,
    isRealtime: false,
    lastRealtimeState: false,
    lastIsPlaying: null
  };
  function safe(txt) {
    return String(txt == null ? "" : txt);
  }

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    } else {
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
  }

  function getTrackSignature(data) {
    if (!data || !data.item) return "no-track";
    return `${data.item.name}-${data.item.id}`;
  }

  function renderLoading() {
    const container = document.getElementById(CONFIG.targetId);
    if (!container) return;
    container.innerHTML = `<div class="${CONFIG.classPrefix}card">
          <div class="${CONFIG.classPrefix}header">
            <div class="skeleton-box" style="width: 18px; height: 18px; margin-right: 8px;"></div>
            <div class="skeleton-box" style="width: 150px; height: 14px;"></div>
            <div class="skeleton-box" style="width: 60px; height: 12px; margin-left: auto;"></div>
          </div>
          <div class="${CONFIG.classPrefix}content">
               <div class="skeleton-box ${CONFIG.classPrefix}cover"></div>
               <div class="${CONFIG.classPrefix}info" style="flex: 1;">
                   <div class="skeleton-box" style="width: 70%; height: 1.2rem; margin-bottom: 8px;"></div>
                   <div class="skeleton-box" style="width: 40%; height: 0.9rem;"></div>
               </div>
          </div>
        </div>`;
  }

  function render() {
    const container = document.getElementById(CONFIG.targetId);
    if (!container) return;
    const data = currentState.data;
    const isRealtime = currentState.isRealtime;
    const sourceText = isRealtime ? "Webhook" : "Spotify API";
    const sourceClass = isRealtime ? "sp-source-webhook" : "sp-source-api";

    if (!data || !data.item) {
      if (currentState.currentTrackSignature !== "no-track" || currentState.lastRealtimeState !== isRealtime) {
        container.innerHTML = `<div class="${CONFIG.classPrefix}card">
                  <div class="${CONFIG.classPrefix}header">
                      <div class="${CONFIG.classPrefix}title">Not Playing</div>
                      <span class="${CONFIG.classPrefix}source-text ${sourceClass}">${sourceText}</span>
                  </div>
                </div>`;
        currentState.currentTrackSignature = "no-track";
        currentState.lastRealtimeState = isRealtime;
      }
      return;
    }

    const item = data.item;
    const isPlaying = data.isPlaying;


    let progress = data.progress_ms;
    if (isPlaying) {
      const elapsed = Date.now() - currentState.lastFetchTime;
      progress += elapsed;
      if (progress > item.duration_ms) progress = item.duration_ms;
    }

    const duration = item.duration_ms;
    const pct = (progress / duration) * 100;

    const newSignature = getTrackSignature(data);

    // Re-render if track changed OR if realtime state changed OR if playing state changed
    if (newSignature !== currentState.currentTrackSignature ||
      currentState.lastRealtimeState !== isRealtime ||
      currentState.lastIsPlaying !== isPlaying) {

      // ... (metadata extraction) ...
      const isEpisode = item.type === 'episode';
      let coverUrl = '', title = item.name, artistName = '', contextName = '', trackUrl = '', artistUrl = '';

      if (isEpisode) {
        coverUrl = item.images?.[0]?.url || item.show?.images?.[0]?.url || '';
        artistName = item.show?.publisher || item.show?.name || '';
        contextName = item.show?.name || '';
        trackUrl = item.external_urls?.spotify || '#';
        artistUrl = item.show?.external_urls?.spotify || '#';
      } else {
        coverUrl = item.album?.images?.[0]?.url || '';
        artistName = item.artists?.map(a => a.name).join(', ') || '';
        contextName = item.album?.name || '';
        trackUrl = item.external_urls?.spotify || '#';
        artistUrl = item.artists?.[0]?.external_urls?.spotify || '#';
      }

      const statusText = isPlaying ? "Spotify - Currently listening to:" : "Spotify - Last listened to:";
      const iconClass = isPlaying ? "sp-icon-playing" : "sp-icon-stopped";
      const statusClass = isPlaying ? "sp-status-playing" : "sp-status-stopped";

      const html = `
            <div class="${CONFIG.classPrefix}card">
              <div class="${CONFIG.classPrefix}header">
                <span class="${CONFIG.classPrefix}icon ${iconClass}"></span>
                <span class="${CONFIG.classPrefix}status ${statusClass}">${statusText}</span>
                <span class="${CONFIG.classPrefix}source-text ${sourceClass}">${sourceText}</span>
              </div>
              
              <div class="${CONFIG.classPrefix}content">
                <img src="${coverUrl}" alt="${safe(contextName)}" class="${CONFIG.classPrefix}cover">
                <div class="${CONFIG.classPrefix}info">
                  <a href="${trackUrl}" target="_blank" rel="noopener noreferrer" class="${CONFIG.classPrefix}track">${safe(title)}</a>
                  <a href="${artistUrl}" target="_blank" rel="noopener noreferrer" class="${CONFIG.classPrefix}artist">${safe(artistName)}</a>
                </div>
              </div>
      
              ${isPlaying ? `
              <div class="${CONFIG.classPrefix}progress-container" id="sp-progress-container">
                <div class="${CONFIG.classPrefix}time" id="sp-current-time">${formatTime(progress)}</div>
                <div class="progress flex-grow-1" style="height: 6px; background-color: var(--bs-secondary-bg-subtle);">
                   <div class="progress-bar bg-success" id="sp-progress-fill" role="progressbar" style="width:${pct}%" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div class="${CONFIG.classPrefix}time">${formatTime(duration)}</div>
              </div>` : ''}
            </div>
          `;
      container.innerHTML = html;
      currentState.currentTrackSignature = newSignature;
      currentState.lastRealtimeState = isRealtime;
      currentState.lastIsPlaying = isPlaying;
    } else if (isPlaying) {
      const timeEl = document.getElementById("sp-current-time");
      const fillEl = document.getElementById("sp-progress-fill");

      if (timeEl) timeEl.textContent = formatTime(progress);
      if (fillEl) {
        fillEl.style.width = `${pct}%`;
        fillEl.setAttribute('aria-valuenow', pct);
      }
    }
  }

  async function fetchStatus() {
    try {
      const res = await fetch(CONFIG.apiEndpoint);
      if (!res.ok) {
        const errText = await res.text();
        console.error("Spotify Backend Error:", errText);
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }
      const json = await res.json();
      console.log("Spotify Widget Response:", json);
      currentState.data = json;
      currentState.lastFetchTime = Date.now();

      console.log("Spotify Widget Response:", json);
      currentState.data = json;
      currentState.lastFetchTime = Date.now();
      render();
    } catch (e) {
      console.error("Spotify Widget Error:", e);
    }
  }

  let fetchIntervalId = null;

  function startPolling() {
    if (!fetchIntervalId) {
      console.log("Spotify: Switching to Fallback Polling (20s)");
      currentState.isRealtime = false;
      render(); // Update dot immediately
      fetchIntervalId = setInterval(fetchStatus, 20000);
      fetchStatus();
    }
  }

  function stopPolling() {
    if (fetchIntervalId) {
      console.log("Spotify: Switching to Real-time (WebSocket)");
      clearInterval(fetchIntervalId);
      fetchIntervalId = null;
    }
    // Always set to true when stopping polling (implied switch to WS)
    if (!currentState.isRealtime) {
      currentState.isRealtime = true;
      render(); // Update dot immediately
    }
  }

  // Exposed function for Lanyard WebSocket (Real-time updates)
  window.updateSpotifyWidget = function (lanyardSpotify) {
    if (!lanyardSpotify) {
      // Lanyard says no Spotify. 
      // Could be: Nothing playing OR Discord closed/offline.
      // Switch to Fallback Polling to check directly with Spotify API.
      startPolling();
      return;
    }

    // We have valid data from WebSocket -> Stop polling
    stopPolling();

    // Map Lanyard data to our internal structure
    const mappedData = {
      isPlaying: true, // Lanyard only sends spotify if playing
      progress_ms: Date.now() - lanyardSpotify.timestamps.start,
      item: {
        id: lanyardSpotify.track_id,
        name: lanyardSpotify.song,
        duration_ms: lanyardSpotify.timestamps.end - lanyardSpotify.timestamps.start,
        type: 'track', // Lanyard usually sends tracks
        artists: lanyardSpotify.artist.split('; ').map(name => ({ name })), // Lanyard separates artists with "; "
        album: {
          name: lanyardSpotify.album,
          images: [{ url: lanyardSpotify.album_art_url }]
        },
        external_urls: {
          spotify: `https://open.spotify.com/track/${lanyardSpotify.track_id}`
        }
      }
    };

    currentState.data = mappedData;
    currentState.lastFetchTime = Date.now();
    render();
  };

  renderLoading();
  // Start with polling (Fallback mode default)
  startPolling();

  // Local progress bar update (always runs)
  setInterval(render, CONFIG.updateIntervalMs);
})();
