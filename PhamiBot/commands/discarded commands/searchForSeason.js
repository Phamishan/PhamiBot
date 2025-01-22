require("dotenv").config();
const axios = require("axios");

const getSeason = async () => {
    try {
        const { data } = await axios.get(
            `https://valorant-api.com/v1/seasons`,
            {
                headers: {
                    ACCEPT: "application/vnd.api+json",
                },
            }
        );

        return data;
    } catch (error) {
        return error.response;
    }
};

module.exports = getSeason;
