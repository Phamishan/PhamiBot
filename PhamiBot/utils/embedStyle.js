// Shared visual language for embeds: brand colors, rank-tier colors, and small formatting helpers.

const BRAND_COLORS = {
    valorant: 0xff4655,
    apex: 0xda292a,
    minecraft: 0x55c12d,
    discord: 0x5865f2,
};

const VALORANT_RANK_COLORS = {
    iron: 0x4b4b4b,
    bronze: 0xa56a3c,
    silver: 0xbfc9d1,
    gold: 0xe8c04c,
    platinum: 0x3fd6c1,
    diamond: 0xb15be0,
    ascendant: 0x36c17a,
    immortal: 0xc23a5e,
    radiant: 0xf5f0a3,
};

const APEX_RANK_COLORS = {
    rookie: 0x8a5a3c,
    bronze: 0xa56a3c,
    silver: 0xbfc9d1,
    gold: 0xe8c04c,
    platinum: 0x3fd6c1,
    diamond: 0x5c7cfa,
    master: 0xb02ee0,
    predator: 0xd23b3b,
    apex: 0xd23b3b,
};

function getValorantRankColor(tierName = "") {
    const key = tierName.toLowerCase().trim().split(" ")[0];
    return VALORANT_RANK_COLORS[key] ?? BRAND_COLORS.valorant;
}

function getApexRankColor(rankName = "") {
    const key = rankName.toLowerCase().trim().split(" ")[0];
    return APEX_RANK_COLORS[key] ?? BRAND_COLORS.apex;
}

function hexStringToColor(hex, fallback = BRAND_COLORS.valorant) {
    if (!hex) return fallback;
    const parsed = parseInt(hex.replace("#", ""), 16);
    return Number.isNaN(parsed) ? fallback : parsed;
}

function buildProgressBar(value, max, size = 10) {
    if (!max || max <= 0) return "▱".repeat(size);
    const clamped = Math.max(0, Math.min(value, max));
    const filled = Math.round((clamped / max) * size);
    return "▰".repeat(filled) + "▱".repeat(size - filled);
}

const IMMORTAL_TIER_OFFSETS = {
    "immortal 1": 0,
    "immortal 2": 100,
    "immortal 3": 200,
};

function buildRrBar(tierName = "", rr = 0) {
    const key = tierName.toLowerCase().trim();
    if (key === "radiant") return null;

    const offset = IMMORTAL_TIER_OFFSETS[key] ?? 0;
    return buildProgressBar(rr - offset, 100);
}

function getPlacementMedal(place) {
    if (place === 1) return "🥇";
    if (place === 2) return "🥈";
    if (place === 3) return "🥉";
    return `#${place}`;
}

function getMatchOutcome(match, playerName) {
    const lowerName = playerName.toLowerCase();
    const player = match?.players?.all_players?.find(
        (p) => p.name.toLowerCase() === lowerName,
    );
    if (!player) return null;

    const teamKey = player.team.toLowerCase();
    const otherTeamKey = teamKey === "blue" ? "red" : "blue";
    const team = match.teams?.[teamKey];
    const otherTeam = match.teams?.[otherTeamKey];
    if (!team || !otherTeam) return null;

    if (team.rounds_won === otherTeam.rounds_won) return "draw";
    return team.has_won ? "win" : "loss";
}

function buildRankHistoryText(games, matches, playerName, size = 5) {
    if (!games || games.length === 0) return "No ranked games played yet.";

    const matchesById = new Map(
        (matches || []).map((match) => [match.metadata?.matchid, match]),
    );

    return games
        .slice(0, size)
        .map((game) => {
            const match = matchesById.get(game.match_id);
            const outcome = match ? getMatchOutcome(match, playerName) : null;
            const change = game.mmr_change_to_last_game;

            let emoji = "<:oooooh:1247454304894189620>";
            if (outcome) {
                if (outcome === "win") {
                    emoji = "<:goodjob:1244552467262214185>";
                } else if (outcome === "loss") {
                    emoji = "<:cri:1244552398643531877>";
                }
            } else if (change > 0) {
                emoji = "<:goodjob:1244552467262214185>";
            } else if (change < 0) {
                emoji = "<:cri:1244552398643531877>";
            }

            const sign = change >= 0 ? "+" : "";
            const map = game.map?.name ?? "Unknown";

            return `${emoji} ${sign}${change} RR • ${map} • <t:${game.date_raw}:R>`;
        })
        .join("\n");
}

module.exports = {
    BRAND_COLORS,
    getValorantRankColor,
    getApexRankColor,
    hexStringToColor,
    buildProgressBar,
    buildRrBar,
    getPlacementMedal,
    getMatchOutcome,
    buildRankHistoryText,
};
