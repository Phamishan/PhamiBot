const axios = require("axios");

const getTeamInfo = async (name, tag) => {
    try {
        const { data } = await axios.get(
            `https://api.henrikdev.xyz/valorant/v1/premier/search?name='${name}'&tag='${tag}'`,
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

module.exports = getTeamInfo;
