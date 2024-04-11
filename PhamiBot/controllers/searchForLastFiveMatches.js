require("dotenv").config();
const axios = require("axios");

const getLastFiveMatches = async (name, tag) => {
    try {
        const { data } = await axios.get(
            `https://api.henrikdev.xyz/valorant/v3/matches/eu/'${name}'/'${tag}'`,
            {
                headers: {
                    ACCEPT: "application/vnd.api+json",
                    Authorization: process.env.VL_API,
                },
            }
        );
        let text = "";

        for (let i = 0; i < data.data.length; i++) {
            const allPlayers = data.data[i].players.all_players;
            var lowercase = JSON.parse(
                JSON.stringify(allPlayers).toLowerCase()
            );

            const found = lowercase.find(
                (element) => element.name == name.toLowerCase()
            );

            if (
                (found.team == "blue" &&
                    data.data[i].teams.blue.has_won == true) ||
                (found.team == "red" && data.data[i].teams.red.has_won == true)
            ) {
                text = text + "<:goodjob:940900834236071958> ";
            } else {
                text = text + "<:cri:940896264680251432> ";
            }
        }
        return text;
    } catch (error) {
        return error.response;
    }
};

module.exports = getLastFiveMatches;
