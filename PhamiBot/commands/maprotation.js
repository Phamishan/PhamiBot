const {
    SlashCommandBuilder,
    EmbedBuilder,
    InteractionContextType,
} = require("discord.js");

const { getMapRotation } = require("../controllers/apexMapRotation.js");
const { getApexErrorMessage } = require("../controllers/apexApi.js");
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

            if (mapRotation.Error) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Error")
                    .setColor(0xff0000)
                    .setDescription(getApexErrorMessage(mapRotation.status));
                return interaction.editReply({ embeds: [errorEmbed] });
            }

            const ranked = mapRotation?.br_ranked;
            const currentMap = ranked?.current?.map ?? "Unavailable";
            const nextMap = ranked?.next?.map ?? "Unavailable";
            const remainingTime =
                ranked?.current?.remainingTimer ?? "Unavailable";
            const currentMapImage = ranked?.current?.asset || null;

            // Discord dynamic timestamp from the API's end time
            const discordTimestamp = ranked?.current?.end
                ? ` (<t:${ranked.current.end}:R>)`
                : "";

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
                        value: `${remainingTime}${discordTimestamp}`,
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
                    iconURL: "https://raw.githubusercontent.com/Phamishan/PhamiBot/development/PhamiBot/pics/phamibot-avatar.png",
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
