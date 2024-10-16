require("dotenv").config();
const axios = require("axios");

const getPlayerRank = async (name, tag) => {
    try {
        const { data } = await axios.get(
            `https://api.henrikdev.xyz/valorant/v2/mmr/eu/${name}/${tag}`,
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

module.exports = getPlayerRank;
