const axios = require("axios");

const getOverWatchPlayer = async (name, tag) => {
    try {
        const { data } = await axios.get(
            `https://overfast-api.tekrop.fr/players/${name}-${tag}/summary`,
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

module.exports = getOverWatchPlayer;
