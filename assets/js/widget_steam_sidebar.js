(function () {
  const CONFIG = {
    apiEndpoints: [
      "/.netlify/functions/steam",
      "https://nico-ruge.netlify.app/.netlify/functions/steam"
    ],
    targetId: "steam-sidebar-widget",
    fetchIntervalMs: 30000
  };

  const PERSONA_STATES = [
    "Offline", "Online", "Busy", "Away",
    "Snooze", "Looking to Trade", "Looking to Play"
  ];

  function safe(value) {
    return String(value == null ? "" : value);
  }

  // Portrait library capsule — clean game cover art
  function getGameCoverUrl(gameid) {
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${gameid}/library_600x900.jpg`;
  }

  function formatPlaytime(hours) {
    if (hours == null) return null;
    if (hours >= 1000) return `${hours.toLocaleString()} hrs`;
    return `${hours} hrs`;
  }

  function renderEmpty() {
    const container = document.getElementById(CONFIG.targetId);
    if (!container) return;
    container.innerHTML = `
      <div class="sidebar-now-playing-label">Steam</div>
      <div class="sidebar-now-playing-meta">Status unavailable.</div>
    `;
  }

  function renderError() {
    const container = document.getElementById(CONFIG.targetId);
    if (!container) return;
    container.innerHTML = `
      <div class="sidebar-now-playing-label">Steam</div>
      <div class="sidebar-now-playing-meta">Could not load status.</div>
    `;
  }

  function renderPlayer(data) {
    const container = document.getElementById(CONFIG.targetId);
    if (!container) return;

    const { gameextrainfo, gameid, personastate, profileurl, avatarfull,
            developer, playtimeHours } = data;
    const isPlaying = Boolean(gameextrainfo);
    const stateLabel = PERSONA_STATES[personastate] || "Offline";

    if (isPlaying) {
      const coverUrl = safe(getGameCoverUrl(gameid));
      const profileLink = safe(profileurl || "https://store.steampowered.com/");
      const playtimeStr = formatPlaytime(playtimeHours);

      const metaParts = [];
      if (developer) metaParts.push(safe(developer));
      if (playtimeStr) metaParts.push(playtimeStr);

      container.innerHTML = `
        <div class="sidebar-now-playing-label is-playing">I'm currently playing</div>
        <div class="sidebar-now-playing-row">
          <img
            src="${coverUrl}"
            alt="${safe(gameextrainfo)}"
            class="sidebar-steam-game-cover"
            onerror="this.src='https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${safe(gameid)}/header.jpg'"
          >
          <div class="sidebar-now-playing-info">
            <a href="${profileLink}" target="_blank" rel="noopener noreferrer"
               class="sidebar-now-playing-title">${safe(gameextrainfo)}</a>
            ${metaParts.length
              ? `<div class="sidebar-now-playing-meta">${metaParts.join(" · ")}</div>`
              : ""}
          </div>
        </div>
      `;
    } else {
      const isOnline = personastate !== 0;
      const avatarUrl = safe(avatarfull || "");
      const profileLink = safe(profileurl || "https://store.steampowered.com/");

      container.innerHTML = `
        <div class="sidebar-now-playing-label">Steam</div>
        <div class="sidebar-now-playing-row">
          ${avatarUrl
            ? `<img src="${avatarUrl}" alt="avatar" class="sidebar-now-playing-cover">`
            : ""}
          <div class="sidebar-now-playing-info">
            <a href="${profileLink}" target="_blank" rel="noopener noreferrer"
               class="sidebar-now-playing-title">${safe(data.personaname || "Unknown")}</a>
            <div class="sidebar-now-playing-meta sidebar-steam-state ${isOnline ? "is-online" : "is-offline"}">${stateLabel}</div>
          </div>
        </div>
      `;
    }
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
        } catch (_e) {
          continue;
        }

        if (!res.ok) continue;
        if (!json || typeof json !== "object") continue;

        renderPlayer(json);
        return;
      } catch (_e) {
        // Try next endpoint
      }
    }
    renderError();
  }

  // ── Carousel cycling ────────────────────────────────────────────────────────
  function initCarousel() {
    const track = document.getElementById("sidebar-widget-track");
    const dots = document.querySelectorAll(".sidebar-widget-dot");
    if (!track || !dots.length) return;

    let currentSlide = 0;
    let autoTimer = null;

    function goToSlide(index) {
      currentSlide = index;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    }

    function scheduleNext() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => {
        goToSlide((currentSlide + 1) % dots.length);
      }, 5000);
    }

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        goToSlide(i);
        scheduleNext();
      });
    });

    scheduleNext();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      fetchStatus();
      initCarousel();
    });
  } else {
    fetchStatus();
    initCarousel();
  }

  setInterval(fetchStatus, CONFIG.fetchIntervalMs);
})();
