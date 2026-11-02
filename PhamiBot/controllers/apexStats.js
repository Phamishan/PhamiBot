const { fetchApex } = require("./apexApi.js");

const getApexStats = (input) =>
    fetchApex("bridge", { player: input, platform: "PC" });

const getApexStatsUUID = (input) => {
    const UUID = input.split("-")[0];
    const PLATFORM = input.split("-")[1];

    return fetchApex("bridge", { uid: UUID, platform: PLATFORM });
};

module.exports = { getApexStats, getApexStatsUUID };
