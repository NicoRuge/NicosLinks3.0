const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_CURRENTLY_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing";
const SPOTIFY_RECENTLY_PLAYED_URL = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(body)
  };
}

async function getAccessToken() {
  const clientId =
    process.env.SPOTIFY_CLIENT_ID ||
    process.env.SPOTIFY_ID ||
    process.env.SPOTIFY_API_CLIENT_ID;
  const clientSecret =
    process.env.SPOTIFY_CLIENT_SECRET ||
    process.env.SPOTIFY_SECRET ||
    process.env.SPOTIFY_API_CLIENT_SECRET;
  const refreshToken =
    process.env.SPOTIFY_REFRESH_TOKEN ||
    process.env.SPOTIFY_TOKEN ||
    process.env.SPOTIFY_API_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Spotify credentials in environment variables.");
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken
    })
  });

  const tokenBody = await res.json().catch(() => ({}));
  if (!res.ok || !tokenBody.access_token) {
    const detail = tokenBody.error_description || tokenBody.error || "Unknown token error";
    throw new Error(`Spotify token request failed: ${detail}`);
  }

  return tokenBody.access_token;
}

async function spotifyGet(url, accessToken) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (res.status === 204) {
    return { status: 204, json: null };
  }

  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

function extractSpotifyError(result) {
  const message =
    result?.json?.error?.message ||
    result?.json?.error_description ||
    result?.json?.error ||
    "Unknown Spotify API error";
  return { status: result?.status || 0, message };
}

function normalizeCurrentPlaying(payload) {
  const item = payload?.item;
  if (!item) return null;
  return {
    isPlaying: Boolean(payload?.is_playing),
    progress_ms: payload?.progress_ms || 0,
    item
  };
}

function normalizeRecentlyPlayed(payload) {
  const first = payload?.items?.[0];
  const track = first?.track;
  if (!track) return null;
  return {
    isPlaying: false,
    progress_ms: 0,
    item: track,
    played_at: first.played_at || null
  };
}

exports.handler = async (event) => {
  // Handle CORS preflight when called cross-origin.
  // (GET requests usually skip preflight, but this keeps behavior predictable.)
  if (event?.httpMethod === "OPTIONS") {
    return jsonResponse(200, {});
  }

  try {
    const accessToken = await getAccessToken();
    const debug = {};

    const current = await spotifyGet(SPOTIFY_CURRENTLY_PLAYING_URL, accessToken);
    debug.currently_playing_status = current.status;
    if (current.status === 200) {
      const normalizedCurrent = normalizeCurrentPlaying(current.json);
      if (normalizedCurrent) {
        return jsonResponse(200, normalizedCurrent);
      }
    }
    if (current.status !== 200 && current.status !== 204) {
      const err = extractSpotifyError(current);
      return jsonResponse(502, {
        error: "Spotify currently-playing request failed",
        detail: err.message,
        status: err.status,
        hint: "Check token scopes and account playback permissions."
      });
    }

    const recent = await spotifyGet(SPOTIFY_RECENTLY_PLAYED_URL, accessToken);
    debug.recently_played_status = recent.status;
    if (recent.status === 200) {
      const normalizedRecent = normalizeRecentlyPlayed(recent.json);
      if (normalizedRecent) {
        return jsonResponse(200, normalizedRecent);
      }
    }
    if (recent.status !== 200) {
      const err = extractSpotifyError(recent);
      return jsonResponse(502, {
        error: "Spotify recently-played request failed",
        detail: err.message,
        status: err.status,
        hint: "Ensure refresh token includes user-read-recently-played scope."
      });
    }

    return jsonResponse(200, {
      isPlaying: false,
      item: null,
      detail: "No current or recent track found.",
      debug
    });
  } catch (error) {
    return jsonResponse(500, {
      error: "Spotify widget backend failed",
      detail: error?.message || "Unknown error"
    });
  }
};
