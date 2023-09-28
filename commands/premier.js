const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const getTeamInfo = require("../controllers/searchForPremierTeam.js");

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("premierteam")
        .setDescription("Finds Premier teams, eg. placeholder#plh")
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

        const premierNameAndTag = input.value.split("#");
        let premierName = premierNameAndTag[0];
        let premierTag = premierNameAndTag[1];

        // Pass the input to the methods which is created in the controllers folder.
        const teamInfo = await getTeamInfo(premierName, premierTag);

        if (teamInfo.status == "404") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription(
                    "The entity was not found (player/match/general data)"
                );

            interaction.editReply({ embeds: [errorEmbed] });
        } else if (teamInfo.status == "400") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription(
                    "Request error by the client (missing query for example)"
                );

            interaction.editReply({ embeds: [errorEmbed] });
        } else if (teamInfo.status == "403") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription(
                    "Request error by the client (missing query for example)"
                );

            interaction.editReply({ embeds: [errorEmbed] });
        } else if (teamInfo.status == "408") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription("Timeout while fetching riot data");

            interaction.editReply({ embeds: [errorEmbed] });
        } else if (teamInfo.status == "429") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription(
                    'Rate limit reached (can be global API limit which affects all users or just you, when the "x-ratelimit-remaining" header is 0 then its a personal limit)'
                );

            interaction.editReply({ embeds: [errorEmbed] });
        } else if (teamInfo.status == "503") {
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
                    `:crown: ${teamInfo.data[0].name}` +
                        "#" +
                        `${teamInfo.data[0].tag} :crown:`
                )
                .setColor(0xff0000)
                .addFields(
                    {
                        name: "Wins:",
                        value: `${teamInfo.data[0].wins}`,
                    },
                    {
                        name: "Losses:",
                        value: `${teamInfo.data[0].losses}`,
                    },
                    {
                        name: "Points:",
                        value: `${teamInfo.data[0].score}` + "/675",
                        inline: true,
                    },
                    {
                        name: "Ranking:",
                        value: `${teamInfo.data[0].ranking}`,
                        inline: true,
                    },
                    {
                        name: "Division:",
                        value: `${teamInfo.data[0].division}`,
                        inline: true,
                    }
                )
                .setThumbnail(
                    "https://pbs.twimg.com/media/FuRiZUuWIAYxAJ3?format=png&name=small"
                )
                .setImage(teamInfo.data[0].customization.image)
                .setTimestamp()
                .setFooter({
                    text: "Created by @phamishan",
                    iconURL: "https://i.imgur.com/pcy4SD7.png",
                });

            // Replying with the embed
            interaction.editReply({ embeds: [embed] });
        }
    },
};
