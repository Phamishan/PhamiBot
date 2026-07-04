const {
    SlashCommandBuilder,
    EmbedBuilder,
    InteractionContextType,
} = require("discord.js");

const { getApexStatsUUID } = require("../controllers/apexStats.js");

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("apexrankfriends")
        .setDescription("Finds Apex Legends profile (ONLY PRIMEHOLDERS+)")
        .addStringOption((option) =>
            option
                .setName("input")
                .setDescription("Choose one from the list")
                .setRequired(true)
                .addChoices(
                    {
                        name: "PH4M1",
                        value: "1001040582944-PC",
                    },
                    {
                        name: "SOREX",
                        value: "1000324103190-PC",
                    },
                    {
                        name: "POLAR",
                        value: "1012700580904-PC",
                    },
                    {
                        name: "RUBGOOSE",
                        value: "1003009770501-PC",
                    },
                    {
                        name: "JACOBFIS",
                        value: "1012591384606-PC",
                    },
                    {
                        name: "SILASBILLUM",
                        value: "1012989559521-PC",
                    },
                    {
                        name: "AGGLITERBOW",
                        value: "3101010257554911893-PS4",
                    },
                    {
                        name: "PATTECARMY",
                        value: "1008903736273-PC",
                    },
                    {
                        name: "Z1LVER",
                        value: "1009143499944-PC",
                    },
                    {
                        name: "SWEETPOISON",
                        value: "2510156661-PC",
                    }
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

            // Fetch data from API
            const apexPlayerStatsUUID = await getApexStatsUUID(input);

            if (apexPlayerStatsUUID.Error) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Error")
                    .setColor(0xff0000)
                    .setDescription("Apex Legends profile not found.");
                return interaction.editReply({ embeds: [errorEmbed] });
            }

            // Create the embed for successful response
            const selectedLegend =
                apexPlayerStatsUUID.legends.selected.LegendName;

            const selectedLegendImage =
                apexPlayerStatsUUID.legends.all[selectedLegend].ImgAssets
                    .banner;

            const embed = new EmbedBuilder()
                .setTitle(`:crown: ${apexPlayerStatsUUID.global.name} :crown:`)
                .setColor(0xff0000)
                .addFields(
                    {
                        name: "Account level:",
                        value: `${apexPlayerStatsUUID.global.level}`,
                        inline: false,
                    },
                    {
                        name: "Rank:",
                        value: `${apexPlayerStatsUUID.global.rank.rankName} ${apexPlayerStatsUUID.global.rank.rankDiv}`,
                        inline: true,
                    },
                    {
                        name: "Rank score:",
                        value: `${apexPlayerStatsUUID.global.rank.rankScore}`,
                        inline: true,
                    },
                )
                .setThumbnail(apexPlayerStatsUUID.global.rank.rankImg)
                .setTimestamp()
                .setFooter({
                    text: "Created by @phamishan",
                    iconURL: "https://i.imgur.com/sNTzfld.jpg",
                });

            if (selectedLegendImage) {
                embed.setImage(selectedLegendImage);
            }

            await interaction.editReply({ embeds: [embed] });
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
