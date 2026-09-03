const {
    SlashCommandBuilder,
    EmbedBuilder,
    InteractionContextType,
} = require("discord.js");

const getTeamInfo = require("../controllers/premierTeam.js");
const getTeamHistory = require("../controllers/premierHistory.js");
const {
    hexStringToColor,
    buildProgressBar,
} = require("../utils/embedStyle.js");

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("premierteam")
        .setDescription("Finds Premier teams, e.g. PlaceHoldia#PLH")
        .addStringOption((option) =>
            option
                .setName("input")
                .setDescription("Enter the team name")
                .setRequired(true),
        )
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
        ),
    async execute(interaction) {
        await interaction.deferReply();

        const input = await interaction.options.get("input");

        const premierNameAndTag = input.value.split("#");
        let premierName = premierNameAndTag[0];
        let premierTag = premierNameAndTag[1];

        // Pass the input to the methods which is created in the controllers folder.
        const teamInfo = await getTeamInfo(premierName, premierTag);
        const teamHistory = await getTeamHistory(premierName, premierTag);

        const errorMessages = {
            404: "The entity was not found (player/match/general data)",
            400: "Request error by the client (missing query for example)",
            403: "Forbidden to connect to the Riot API (mainly maintenance reasons on Riot's side like patches) or to the HenrikDev API itself because of bot prevention for example",
            408: "Timeout while fetching Riot data",
            429: 'Rate limit reached (can be global API limit which affects all users or just you, when the "x-ratelimit-remaining" header is 0 then it’s a personal limit)',
            503: "Riot API seems to be down, API unable to connect",
        };

        const errorStatus = [teamInfo.status, teamHistory.status].find(
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

        const { wins, losses } = teamInfo.data.stats;
        const winRate =
            wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
        const pointsBar = buildProgressBar(teamInfo.data.placement.points, 400);
        const teamColor = hexStringToColor(teamInfo.data.customization.primary);

        const leagueMatches = teamHistory.data.league_matches.slice(0, 5);
        let historyText = "No matches played yet.";

        if (leagueMatches.length > 0) {
            historyText = leagueMatches
                .map((match) => {
                    const pointsDiff = match.points_after - match.points_before;
                    const timestamp = Math.floor(
                        new Date(match.started_at).getTime() / 1000,
                    );

                    let emoji = "<:oooooh:1247454304894189620>";
                    if (pointsDiff >= 50) {
                        emoji = "<:goodjob:1244552467262214185>";
                    } else if (pointsDiff !== 0) {
                        emoji = "<:cri:1244552398643531877>";
                    }

                    return `${emoji} ${pointsDiff >= 0 ? "+" : ""}${pointsDiff} Points • <t:${timestamp}:R>`;
                })
                .join("\n");
        }

        // Creating the embed
        const embed = new EmbedBuilder()
            .setTitle(`${teamInfo.data.name}` + "#" + `${teamInfo.data.tag}`)
            .setColor(teamColor)
            .addFields(
                {
                    name: "Record",
                    value: `${wins}W - ${losses}L  (${winRate}% winrate)`,
                    inline: false,
                },
                {
                    name: "Points",
                    value: `${pointsBar} ${teamInfo.data.placement.points}/400`,
                    inline: false,
                },
                {
                    name: "Rank",
                    value: `${teamInfo.data.placement.place} in ${teamInfo.data.placement.conference}`,
                    inline: true,
                },
                {
                    name: "Division",
                    value: `${divsionRank}`,
                    inline: true,
                },
                {
                    name: "Last 5 premier matches",
                    value: historyText,
                    inline: false,
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
