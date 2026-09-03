const {
    SlashCommandBuilder,
    EmbedBuilder,
    InteractionContextType,
} = require("discord.js");

const { getMapRotation } = require("../controllers/apexMapRotation.js");
const { BRAND_COLORS } = require("../utils/embedStyle.js");

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("maprotation")
        .setDescription(
            "Finds the current and next map [RANKED] (Apex Legends)",
        )
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply(); // Ensure the interaction is deferred

            // Fetch data from API
            const mapRotation = await getMapRotation();

            if (
                !mapRotation ||
                mapRotation.error ||
                mapRotation.status >= 400
            ) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Error")
                    .setColor(0xff0000)
                    .setDescription(
                        "Error occurred while fetching map rotation data.",
                    );
                return interaction.editReply({ embeds: [errorEmbed] });
            }

            const currentMap =
                mapRotation?.ranked?.current?.map ?? "Unavailable";
            const nextMap = mapRotation?.ranked?.next?.map ?? "Unavailable";
            const remainingTime =
                mapRotation?.ranked?.current?.remainingTimer ||
                mapRotation?.ranked?.current?.remainingMins ||
                "Unavailable";
            const currentMapImage = mapRotation?.ranked?.current?.asset || null;

            // Calculate Discord dynamic timestamp
            let discordTimestamp = "";
            if (remainingTime !== "Unavailable") {
                const now = Date.now();
                const endDate = new Date(now);

                if (
                    typeof mapRotation?.ranked?.current?.remainingMins ===
                    "number"
                ) {
                    endDate.setMinutes(
                        endDate.getMinutes() +
                            mapRotation.ranked.current.remainingMins,
                    );
                } else if (
                    typeof mapRotation?.ranked?.current?.remainingTimer ===
                    "string"
                ) {
                    const timerStr = mapRotation.ranked.current.remainingTimer;
                    const hourMatch = timerStr.match(/(\d+)h/);
                    const minMatch = timerStr.match(/(\d+)m/);

                    if (hourMatch)
                        endDate.setHours(
                            endDate.getHours() + parseInt(hourMatch[1]),
                        );
                    if (minMatch)
                        endDate.setMinutes(
                            endDate.getMinutes() + parseInt(minMatch[1]),
                        );
                }

                const unixTimestamp = Math.floor(endDate.getTime() / 1000);
                discordTimestamp = `<t:${unixTimestamp}:R>`;
            }

            // Create the embed for successful response
            const embed = new EmbedBuilder()
                .setTitle(":map: Apex Map Rotation [RANKED] :map:")
                .setColor(BRAND_COLORS.apex)
                .addFields(
                    {
                        name: "Current Map",
                        value: currentMap,
                        inline: true,
                    },
                    {
                        name: "Time Remaining",
                        value: `${remainingTime} (${discordTimestamp})`,
                        inline: true,
                    },
                    {
                        name: "Next Map",
                        value: nextMap,
                        inline: true,
                    },
                )
                .setTimestamp()
                .setFooter({
                    text: "Created by @phamishan",
                    iconURL: "https://i.imgur.com/sNTzfld.jpg",
                });

            if (currentMapImage) {
                embed.setImage(currentMapImage);
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
