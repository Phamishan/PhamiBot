const axios = require("axios");

const getPlayerInfoByPUUID = async (puuid) => {
    try {
        const { data } = await axios.get(
            `https://api.henrikdev.xyz/valorant/v1/by-puuid/account/${puuid}`,
            {
                headers: {
                    ACCEPT: "application/vnd.api+json",
                    Authorization: process.env.VL_API,
                },
            }
        );
        return data;
    } catch (error) {
        return error.response;
    }
};

module.exports = getPlayerInfoByPUUID;
