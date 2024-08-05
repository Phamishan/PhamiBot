const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const getPlayerRank = require("../controllers/searchForPlayerRank.js");
const getPlayerInfo = require("../controllers/searchForPlayerInfo.js");
const getLastFiveMatches = require("../controllers/searchForLastFiveMatches.js");

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("valrank")
        .setDescription("Finds valorant profile, eg. ph4m1#yin")
        .addStringOption((option) =>
            option
                .setName("input")
                .setDescription("input to echo back")
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        // Wait for the users input and store that in const input
        const input = await interaction.options.get("input");

        const playerNameAndTag = input.value.split("#");
        let playerName = playerNameAndTag[0];
        let playerTag = playerNameAndTag[1];

        // Pass the input to the methods which is created in the controllers folder.
        const playerRank = await getPlayerRank(playerName, playerTag);
        const playerInfo = await getPlayerInfo(playerName, playerTag);
        const playerMatches = await getLastFiveMatches(playerName, playerTag);

        if (playerRank.status == "404" || playerInfo.status == "404") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription(
                    "The entity was not found (player/match/general data)"
                );

            interaction.editReply({ embeds: [errorEmbed] });
        } else if (playerRank.status == "400" || playerInfo.status == "400") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription(
                    "Request error by the client (missing query for example)"
                );

            interaction.editReply({ embeds: [errorEmbed] });
        } else if (playerRank.status == "403" || playerInfo.status == "403") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription(
                    "Forbidden to connect to the Riot API (mainly maintenance reasons on riot side like patches) or to the HenrikDev API itself because of bot prevention for example"
                );

            interaction.editReply({ embeds: [errorEmbed] });
        } else if (playerRank.status == "408" || playerInfo.status == "408") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription("Timeout while fetching riot data");

            interaction.editReply({ embeds: [errorEmbed] });
        } else if (playerRank.status == "429" || playerInfo.status == "429") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription(
                    'Rate limit reached (can be global API limit which affects all users or just you, when the "x-ratelimit-remaining" header is 0 then its a personal limit)'
                );

            interaction.editReply({ embeds: [errorEmbed] });
        } else if (playerRank.status == "503" || playerInfo.status == "503") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription(
                    "Riot API seems to be down, API unable to connect"
                );

            interaction.editReply({ embeds: [errorEmbed] });
        } else {
            // Creating the embed
            const embed = new EmbedBuilder()
                .setTitle(
                    `:crown: ${playerInfo.data.name}` +
                        "#" +
                        `${playerInfo.data.tag} :crown:`
                )
                .setColor(0xff0000)
                .addFields(
                    {
                        name: "Account level:",
                        value: `${playerInfo.data.account_level}`,
                        inline: false,
                    },
                    {
                        name: "Rank:",
                        value: `${playerRank.data.current_data.currenttierpatched}`,
                        inline: true,
                    },
                    {
                        name: "RR:",
                        value: `${playerRank.data.current_data.ranking_in_tier}`,
                        inline: true,
                    },
                    {
                        name: "Last 5 ranked games:",
                        value: `${playerMatches}`,
                        inline: false,
                    }
                )
                .setImage(`${playerInfo.data.card.wide}`)
                .setThumbnail(`${playerRank.data.current_data.images.small}`)
                .setTimestamp()
                .setFooter({
                    text: "Created by @phamishan",
                    iconURL: "https://i.imgur.com/sNTzfld.jpg",
                });

            // Replying with the embed
            interaction.editReply({ embeds: [embed] });
        }
    },
};
