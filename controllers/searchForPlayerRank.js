const axios = require("axios");

const getPlayerRank = async (name, tag) => {
    try {
        const { data } = await axios.get(
            `https://api.henrikdev.xyz/valorant/v1/mmr/eu/'${name}'/'${tag}'`,
            {
                headers: {
                    ACCEPT: "application/vnd.api+json",
                    Authorization: process.env.VL_API,
                },
            }
        );

        return data;
    } catch (error) {
        let fejl = error.response;
        return fejl;
    }
};

module.exports = getPlayerRank;
