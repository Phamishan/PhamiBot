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

function formatRrProgress(tierName = "", rr = 0) {
    const rrBar = buildRrBar(tierName, rr);
    if (!rrBar) return `${rr} RR`; // Radiant

    const goal =
        (IMMORTAL_TIER_OFFSETS[tierName.toLowerCase().trim()] ?? 0) + 100;
    return `${rrBar} ${rr}/${goal} RR`;
}

const APEX_RANK_FLOORS = [
    { tier: "rookie", div: 4, rp: 0 },
    { tier: "rookie", div: 3, rp: 250 },
    { tier: "rookie", div: 2, rp: 500 },
    { tier: "rookie", div: 1, rp: 750 },
    { tier: "bronze", div: 4, rp: 1000 },
    { tier: "bronze", div: 3, rp: 1500 },
    { tier: "bronze", div: 2, rp: 2000 },
    { tier: "bronze", div: 1, rp: 2500 },
    { tier: "silver", div: 4, rp: 3000 },
    { tier: "silver", div: 3, rp: 3500 },
    { tier: "silver", div: 2, rp: 4000 },
    { tier: "silver", div: 1, rp: 4750 },
    { tier: "gold", div: 4, rp: 5500 },
    { tier: "gold", div: 3, rp: 6250 },
    { tier: "gold", div: 2, rp: 7000 },
    { tier: "gold", div: 1, rp: 7750 },
    { tier: "platinum", div: 4, rp: 8500 },
    { tier: "platinum", div: 3, rp: 9250 },
    { tier: "platinum", div: 2, rp: 10000 },
    { tier: "platinum", div: 1, rp: 11000 },
    { tier: "diamond", div: 4, rp: 12000 },
    { tier: "diamond", div: 3, rp: 13000 },
    { tier: "diamond", div: 2, rp: 14000 },
    { tier: "diamond", div: 1, rp: 15000 },
    { tier: "master", div: 0, rp: 16000 },
];

function buildRpBar(rankName = "", rankDiv = 0, rp = 0) {
    const tier = rankName.toLowerCase().trim();
    const index = APEX_RANK_FLOORS.findIndex(
        (floor) => floor.tier === tier && floor.div === rankDiv,
    );
    const next = APEX_RANK_FLOORS[index + 1];
    if (index === -1 || !next) return null; // Unranked, Master, Predator

    const floor = APEX_RANK_FLOORS[index].rp;
    return buildProgressBar(rp - floor, next.rp - floor);
}

function formatRpProgress(rankName = "", rankDiv = 0, rp = 0) {
    const rpBar = buildRpBar(rankName, rankDiv, rp);
    if (!rpBar) return `${rp} RP`; // Unranked, Master, Predator

    const tier = rankName.toLowerCase().trim();
    const index = APEX_RANK_FLOORS.findIndex(
        (floor) => floor.tier === tier && floor.div === rankDiv,
    );
    return `${rpBar} ${rp}/${APEX_RANK_FLOORS[index + 1].rp} RP`;
}

function isApexRankTableOutdated(rankName = "", rankDiv = 0, rp = 0) {
    const tier = rankName.toLowerCase().trim();
    if (tier === "unranked") return false;

    const masterFloor = APEX_RANK_FLOORS[APEX_RANK_FLOORS.length - 1].rp;
    if (tier === "apex predator") return rp < masterFloor;

    const index = APEX_RANK_FLOORS.findIndex(
        (floor) => floor.tier === tier && floor.div === rankDiv,
    );
    if (index === -1) return true; // a rank the table doesn't know

    const next = APEX_RANK_FLOORS[index + 1];
    return rp < APEX_RANK_FLOORS[index].rp || (!!next && rp >= next.rp);
}

function formatApexRank(rankName = "", rankDiv = 0) {
    return rankDiv ? `${rankName} ${rankDiv}` : rankName;
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

    const sortedGames = [...games].sort((a, b) => b.date_raw - a.date_raw);

    const matchesById = new Map(
        (matches || []).map((match) => [match.metadata?.matchid, match]),
    );

    return sortedGames
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
            // Only known when HenrikDev still has the match details (recent games).
            const agent = match?.players?.all_players?.find(
                (p) => p.name.toLowerCase() === playerName.toLowerCase(),
            )?.character;

            return `${emoji} ${sign}${change} RR • ${map}${agent ? ` • ${agent}` : ""} • <t:${game.date_raw}:R>`;
        })
        .join("\n");
}

function buildApexMatchHistoryText(matches, size = 5) {
    const games = (matches || []).filter((match) => match.kind === "match");
    if (games.length === 0) return "No tracked ranked games yet.";

    return games
        .slice(0, size)
        .map((match) => {
            let emoji = "<:oooooh:1247454304894189620>";
            if (match.delta > 0) {
                emoji = "<:goodjob:1244552467262214185>";
            } else if (match.delta < 0) {
                emoji = "<:cri:1244552398643531877>";
            }

            const sign = match.delta >= 0 ? "+" : "";
            const time = Math.floor(match.ts / 1000);

            const legend = match.legend ? ` • ${match.legend}` : "";

            return `${emoji} ${sign}${match.delta} RP${legend} • <t:${time}:R>`;
        })
        .join("\n");
}

module.exports = {
    buildApexMatchHistoryText,
    BRAND_COLORS,
    getValorantRankColor,
    getApexRankColor,
    hexStringToColor,
    buildProgressBar,
    buildRrBar,
    formatRrProgress,
    buildRpBar,
    formatRpProgress,
    isApexRankTableOutdated,
    formatApexRank,
    getPlacementMedal,
    getMatchOutcome,
    buildRankHistoryText,
};
