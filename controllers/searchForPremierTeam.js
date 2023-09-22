const axios = require("axios");

const getTeamInfo = async (name, tag, req, res) => {
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
        let fejl = error.response;
        return fejl;
    }
};

module.exports = getTeamInfo;
