const {
    SlashCommandBuilder,
    EmbedBuilder,
    InteractionContextType,
} = require("discord.js");

const { getApexStatsUUID } = require("../controllers/apexStats.js");
const { getApexErrorMessage } = require("../controllers/apexApi.js");
const { getTrackedMatches } = require("../controllers/apexTracker.js");
const { checkApexRankTable } = require("../utils/apexRankNotice.js");
const {
    getApexRankColor,
    formatRpProgress,
    formatApexRank,
    buildApexMatchHistoryText,
} = require("../utils/embedStyle.js");

const TRACKER_IDS = {
    "1012700580904-PC": "cc8ce174-df70-48b2-8aab-ff2f4f3423a1", // POLAR
    "1001040582944-PC": "71fb5a8a-df7d-4854-b51e-5ef7ab9d7ed5", // PH4M1
    "1000324103190-PC": "c5baf8bf-4a6d-4e20-88a3-c69fc7810b08", // MEEJI
    "1008903736273-PC": "431ee30f-c882-4025-af9e-127c4d97eb30", // PATTECARMY
    "1003009770501-PC": "4b7360e6-28b0-4bb3-94fe-953c5736c114", // RUBGOOSE
    "2510156661-PC": "570206a0-4af3-4ab5-8be7-daa1da1c93bc", // SWEETPOISON
    "1009143499944-PC": "01873697-5bcc-4352-b0e6-7a9691943e6e", // Z1LVER
    "1012591384606-PC": "26a6f966-4b0f-4a43-a6e5-44bd369dcfcd", // JACOBFIS
};

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("apexrankfriends")
        .setDescription(
            "Finds Apex Legends profile (ONLY OG PLACEHOLDER & PREMIUMHOLDERS)",
        )
        .addStringOption((option) =>
            option
                .setName("input")
                .setDescription("Choose one from the list")
                .setRequired(true)
                .addChoices(
                    {
                        name: "POLAR",
                        value: "1012700580904-PC",
                    },
                    {
                        name: "PH4M1",
                        value: "1001040582944-PC",
                    },
                    {
                        name: "MEEJI",
                        value: "1000324103190-PC",
                    },
                    {
                        name: "PATTECARMY",
                        value: "1008903736273-PC",
                    },
                    {
                        name: "RUBGOOSE",
                        value: "1003009770501-PC",
                    },
                    {
                        name: "SWEETPOISON",
                        value: "2510156661-PC",
                    },
                    {
                        name: "Z1LVER",
                        value: "1009143499944-PC",
                    },
                    {
                        name: "JACOBFIS",
                        value: "1012591384606-PC",
                    },
                ),
        )
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply(); // Ensure the interaction is deferred

            const input = interaction.options.get("input").value;

            // Fetch data from APIs
            const [apexPlayerStatsUUID, trackedMatches] = await Promise.all([
                getApexStatsUUID(input),
                getTrackedMatches(TRACKER_IDS[input]),
            ]);

            if (apexPlayerStatsUUID.Error) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Error")
                    .setColor(0xff0000)
                    .setDescription(
                        getApexErrorMessage(apexPlayerStatsUUID.status),
                    );
                return interaction.editReply({ embeds: [errorEmbed] });
            }

            // Create the embed for successful response
            const selectedLegend =
                apexPlayerStatsUUID.legends.selected.LegendName;

            const selectedLegendImage =
                apexPlayerStatsUUID.legends.all[selectedLegend].ImgAssets
                    .banner;

            const clubTag = apexPlayerStatsUUID.global.tag;
            const playerName = clubTag
                ? `[${clubTag}] ${apexPlayerStatsUUID.global.name}`
                : apexPlayerStatsUUID.global.name;

            const { rankName, rankDiv, rankScore, rankImg } =
                apexPlayerStatsUUID.global.rank;

            const embed = new EmbedBuilder()
                .setTitle(`:crown: ${playerName} :crown:`)
                .setColor(getApexRankColor(rankName))
                .addFields(
                    {
                        name: "Account level",
                        value: `${apexPlayerStatsUUID.global.level}`,
                        inline: false,
                    },
                    {
                        name: "Rank",
                        value: formatApexRank(rankName, rankDiv),
                        inline: true,
                    },
                    {
                        name: "RP",
                        value: formatRpProgress(rankName, rankDiv, rankScore),
                        inline: true,
                    },
                    {
                        name: "Last 5 ranked games",
                        value: trackedMatches.Error
                            ? "No tracked ranked games yet."
                            : buildApexMatchHistoryText(trackedMatches.matches),
                        inline: false,
                    },
                )
                .setThumbnail(rankImg)
                .setTimestamp()
                .setFooter({
                    text: "Created by @phamishan",
                    iconURL: "https://raw.githubusercontent.com/Phamishan/PhamiBot/development/PhamiBot/pics/phamibot-avatar.png",
                });

            if (selectedLegendImage) {
                // Some banner URLs contain spaces (e.g. "mad maggie.jpg"), which Discord rejects.
                embed.setImage(encodeURI(selectedLegendImage));
            }

            await interaction.editReply({ embeds: [embed] });

            checkApexRankTable(
                interaction.client,
                apexPlayerStatsUUID.global.name,
                apexPlayerStatsUUID.global.rank,
            );
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(
                    "An error occurred while processing your request.",
                );
            } else {
                await interaction.reply(
                    "An error occurred while processing your request.",
                );
            }
        }
    },
};
