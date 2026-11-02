const { fetchApex } = require("./apexApi.js");

const getMapRotation = () => fetchApex("maprotation", { version: 5 });

module.exports = { getMapRotation };
