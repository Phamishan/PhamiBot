const { isApexRankTableOutdated, formatApexRank } = require("./embedStyle.js");

const OWNER_ID = "336187495978893312";

const notifiedRanks = new Set();

async function checkApexRankTable(client, playerName, rank) {
    const { rankName, rankDiv, rankScore } = rank;
    if (!isApexRankTableOutdated(rankName, rankDiv, rankScore)) return;

    const rankLabel = formatApexRank(rankName, rankDiv);
    if (notifiedRanks.has(rankLabel)) return;
    notifiedRanks.add(rankLabel);

    const message = `:warning: Apex RP table looks outdated: **${playerName}** is **${rankLabel}** with **${rankScore} RP**, which doesn't fit the table. Update APEX_RANK_FLOORS in utils/embedStyle.js.`;
    console.warn(message);

    try {
        const owner = await client.users.fetch(OWNER_ID);
        await owner.send(message);
    } catch (error) {
        console.error("Failed to DM the owner about the Apex RP table:", error);
    }
}

module.exports = { checkApexRankTable };
