const STEAM_API_URL =
  "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/";
const STEAM_OWNED_GAMES_URL =
  "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/";
const STEAM_STORE_API_URL =
  "https://store.steampowered.com/api/appdetails";

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

async function fetchAppDetails(gameid) {
  try {
    const res = await fetch(
      `${STEAM_STORE_API_URL}?appids=${gameid}&filters=basic`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.[gameid]?.data;
    if (!data) return null;
    return {
      developer: data.developers?.[0] || null
    };
  } catch (_e) {
    return null;
  }
}

async function fetchGamePlaytime(apiKey, steamId, gameid) {
  try {
    const url =
      `${STEAM_OWNED_GAMES_URL}?key=${apiKey}&steamid=${steamId}` +
      `&include_appinfo=false&include_played_free_games=true`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const games = json?.response?.games || [];
    const game = games.find((g) => String(g.appid) === String(gameid));
    if (!game) return null;
    return Math.round(game.playtime_forever / 60); // minutes → hours
  } catch (_e) {
    return null;
  }
}

exports.handler = async (event) => {
  if (event?.httpMethod === "OPTIONS") {
    return jsonResponse(200, {});
  }

  const apiKey = process.env.STEAM_API_KEY;
  const steamId = process.env.STEAM_ID;

  if (!apiKey || !steamId) {
    return jsonResponse(500, {
      error: "Missing STEAM_API_KEY or STEAM_ID environment variables."
    });
  }

  try {
    const res = await fetch(
      `${STEAM_API_URL}?key=${apiKey}&steamids=${steamId}`
    );

    if (!res.ok) {
      return jsonResponse(502, {
        error: "Steam API request failed",
        status: res.status
      });
    }

    const json = await res.json();
    const player = json?.response?.players?.[0];

    if (!player) {
      return jsonResponse(404, { error: "Player not found" });
    }

    const gameid = player.gameid || null;
    let developer = null;
    let playtimeHours = null;

    if (gameid) {
      const [appDetails, playtime] = await Promise.all([
        fetchAppDetails(gameid),
        fetchGamePlaytime(apiKey, steamId, gameid)
      ]);
      developer = appDetails?.developer || null;
      playtimeHours = playtime;
    }

    return jsonResponse(200, {
      personaname: player.personaname || null,
      profileurl: player.profileurl || null,
      avatarfull: player.avatarfull || null,
      personastate: player.personastate ?? 0,
      gameextrainfo: player.gameextrainfo || null,
      gameid,
      developer,
      playtimeHours
    });
  } catch (error) {
    return jsonResponse(500, {
      error: "Steam widget backend failed",
      detail: error?.message || "Unknown error"
    });
  }
};
