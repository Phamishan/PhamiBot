require("dotenv").config();
const axios = require("axios");

const getPlayerInfo = async (name, tag) => {
    try {
        const { data } = await axios.get(
            `https://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`,
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

module.exports = getPlayerInfo;
