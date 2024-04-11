require("dotenv").config();
const axios = require("axios");

const getBundles = async () => {
    try {
        const { data } = await axios.get(
            `https://api.henrikdev.xyz/valorant/v2/store-featured`,
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

module.exports = getBundles;
