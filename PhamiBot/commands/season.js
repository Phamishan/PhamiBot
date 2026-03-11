const {
    SlashCommandBuilder,
    EmbedBuilder,
    InteractionContextType,
} = require("discord.js");

const getSeason = require("../controllers/searchForSeason.js");

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("season")
        .setDescription("Shows the current VALORANT episode and act")
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const seasonResponse = await getSeason();

            if (
                !seasonResponse ||
                seasonResponse.status >= 400 ||
                !Array.isArray(seasonResponse.data)
            ) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Error")
                    .setColor(0xff0000)
                    .setDescription(
                        "Error occurred while fetching VALORANT season data.",
                    );
                return interaction.editReply({ embeds: [errorEmbed] });
            }

            const now = new Date();
            const isActiveSeason = (season) => {
                if (!season?.startTime || !season?.endTime) {
                    return false;
                }

                const start = new Date(season.startTime);
                const end = new Date(season.endTime);

                // Use [start, end) so boundary timestamps do not match two seasons.
                return start <= now && now < end;
            };

            // parentUuid is null for Episodes and a string for Acts.
            const currentEpisode = seasonResponse.data.find(
                (season) =>
                    season?.parentUuid === null && isActiveSeason(season),
            );

            const currentAct = seasonResponse.data.find(
                (season) =>
                    typeof season?.parentUuid === "string" &&
                    season.parentUuid === currentEpisode?.uuid &&
                    isActiveSeason(season),
            );

            if (!currentEpisode || !currentAct) {
                const notFoundEmbed = new EmbedBuilder()
                    .setTitle("VALORANT Season")
                    .setColor(0xff0000)
                    .setDescription(
                        "Could not determine the current episode and act right now.",
                    );
                return interaction.editReply({ embeds: [notFoundEmbed] });
            }

            const actEndUnix = Math.floor(
                new Date(currentAct.endTime).getTime() / 1000,
            );

            const embed = new EmbedBuilder()
                .setTitle(":calendar: VALORANT Season :calendar:")
                .setColor(0xff0000)
                .addFields(
                    {
                        name: "Current Episode",
                        value: currentEpisode.displayName || "Unavailable",
                        inline: true,
                    },
                    {
                        name: "Current Act",
                        value: currentAct.displayName || "Unavailable",
                        inline: true,
                    },
                    {
                        name: "Act Ends",
                        value: `<t:${actEndUnix}:F> (<t:${actEndUnix}:R>)`,
                        inline: false,
                    },
                )
                .setTimestamp()
                .setImage(
                    "https://media.altchar.com/prod/images/gm_featured_image/4c75017a2001-valorant-episode-8-act-3.jpg",
                )
                .setFooter({
                    text: "Created by @phamishan",
                    iconURL: "https://i.imgur.com/sNTzfld.jpg",
                });

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
