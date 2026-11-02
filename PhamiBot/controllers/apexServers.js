const { fetchApex } = require("./apexApi.js");

const getServerStatus = () => fetchApex("servers");

module.exports = { getServerStatus };
