const {
    SlashCommandBuilder,
    EmbedBuilder,
    InteractionContextType,
} = require("discord.js");

const { getApexStats } = require("../controllers/apexStats.js");
const { getApexErrorMessage } = require("../controllers/apexApi.js");
const { checkApexRankTable } = require("../utils/apexRankNotice.js");
const {
    getApexRankColor,
    formatRpProgress,
    formatApexRank,
} = require("../utils/embedStyle.js");

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("apexrank")
        .setDescription(
            "Finds Apex Legends profile, e.g. PH4M1 (ENTER EA ACCOUNT NAME)",
        )
        .addStringOption((option) =>
            option
                .setName("input")
                .setDescription("Enter the player's name")
                .setRequired(true),
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

            // Fetch data from API
            const apexPlayerStats = await getApexStats(input);

            if (apexPlayerStats.Error) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Error")
                    .setColor(0xff0000)
                    .setDescription(
                        getApexErrorMessage(apexPlayerStats.status),
                    );
                return interaction.editReply({ embeds: [errorEmbed] });
            }

            // Create the embed for successful response
            const selectedLegend = apexPlayerStats.legends.selected.LegendName;

            const selectedLegendImage =
                apexPlayerStats.legends.all[selectedLegend].ImgAssets.banner;

            const clubTag = apexPlayerStats.global.tag;
            const playerName = clubTag
                ? `[${clubTag}] ${apexPlayerStats.global.name}`
                : apexPlayerStats.global.name;

            const { rankName, rankDiv, rankScore, rankImg } =
                apexPlayerStats.global.rank;

            const embed = new EmbedBuilder()
                .setTitle(`:crown: ${playerName} :crown:`)
                .setColor(getApexRankColor(rankName))
                .addFields(
                    {
                        name: "Account level",
                        value: `${apexPlayerStats.global.level}`,
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
                )
                .setThumbnail(rankImg)
                .setTimestamp()
                .setFooter({
                    text: "Created by @phamishan",
                    iconURL: "https://i.imgur.com/sNTzfld.jpg",
                });

            if (selectedLegendImage) {
                // Some banner URLs contain spaces (e.g. "mad maggie.jpg"), which Discord rejects.
                embed.setImage(encodeURI(selectedLegendImage));
            }

            await interaction.editReply({ embeds: [embed] });

            checkApexRankTable(
                interaction.client,
                apexPlayerStats.global.name,
                apexPlayerStats.global.rank,
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
