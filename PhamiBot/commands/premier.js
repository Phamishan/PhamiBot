const {
    SlashCommandBuilder,
    EmbedBuilder,
    InteractionContextType,
} = require("discord.js");

const getTeamInfo = require("../controllers/premierTeam.js");

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("premierteam")
        .setDescription("Finds Premier teams, e.g. In Ortum#IO")
        .addStringOption((option) =>
            option
                .setName("input")
                .setDescription("input to echo back")
                .setRequired(true),
        )
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
        ),
    async execute(interaction) {
        // Wait for the users input and store that in const input
        const input = await interaction.options.get("input");

        const premierNameAndTag = input.value.split("#");
        let premierName = premierNameAndTag[0];
        let premierTag = premierNameAndTag[1];

        // Pass the input to the methods which is created in the controllers folder.
        const teamInfo = await getTeamInfo(premierName, premierTag);

        const errorMessages = {
            404: "The entity was not found (player/match/general data)",
            400: "Request error by the client (missing query for example)",
            403: "Forbidden to connect to the Riot API (mainly maintenance reasons on Riot's side like patches) or to the HenrikDev API itself because of bot prevention for example",
            408: "Timeout while fetching Riot data",
            429: 'Rate limit reached (can be global API limit which affects all users or just you, when the "x-ratelimit-remaining" header is 0 then it’s a personal limit)',
            503: "Riot API seems to be down, API unable to connect",
        };

        const errorStatus = [teamInfo.status].find(
            (status) => errorMessages[status],
        );

        if (errorStatus) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("Error")
                .setColor(0xff0000)
                .setDescription(errorMessages[errorStatus]);
            return interaction.editReply({ embeds: [errorEmbed] });
        }
        divsionRanks = [
            "Open 1",
            "Open 2",
            "Open 3",
            "Open 4",
            "Open 5",
            "Intermediate 1",
            "Intermediate 2",
            "Intermediate 3",
            "Intermediate 4",
            "Intermediate 5",
            "Advanced 1",
            "Advanced 2",
            "Advanced 3",
            "Advanced 4",
            "Advanced 5",
            "Elite 1",
            "Elite 2",
            "Elite 3",
            "Elite 4",
            "Elite 5",
            "Contender",
        ];

        for (let i = 0; i < divsionRanks.length; i++) {
            if (teamInfo.data.placement.division == i) {
                divsionRank = divsionRanks[i - 1];
            }
        }

        // Creating the embed
        const embed = new EmbedBuilder()
            .setTitle(
                `:crown: ${teamInfo.data.name}` +
                    "#" +
                    `${teamInfo.data.tag} :crown:`,
            )
            .setColor(0xff0000)
            .addFields(
                {
                    name: "Wins:",
                    value: `${teamInfo.data.stats.wins}`,
                },
                {
                    name: "Losses:",
                    value: `${teamInfo.data.stats.losses}`,
                },
                {
                    name: "Points:",
                    value: `${teamInfo.data.placement.points}` + "/600",
                    inline: true,
                },
                {
                    name: "Ranking:",
                    value: `${teamInfo.data.placement.place}`,
                    inline: true,
                },
                {
                    name: "Division:",
                    value: `${divsionRank}`,
                    inline: true,
                },
            )
            .setThumbnail(
                "https://pbs.twimg.com/media/FuRiZUuWIAYxAJ3?format=png&name=small",
            )
            .setImage(teamInfo.data.customization.image)
            .setTimestamp()
            .setFooter({
                text: "Created by @phamishan",
                iconURL: "https://i.imgur.com/sNTzfld.jpg",
            });

        // Replying with the embed
        interaction.editReply({ embeds: [embed] });
    },
};
