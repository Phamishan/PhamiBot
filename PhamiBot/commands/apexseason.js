const {
    SlashCommandBuilder,
    EmbedBuilder,
    InteractionContextType,
} = require("discord.js");

const { getApexSeason } = require("../controllers/apexSeason.js");
const { BRAND_COLORS, buildProgressBar } = require("../utils/embedStyle.js");

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("apexseason")
        .setDescription("Shows the current Apex Legends season")
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const apexSeason = await getApexSeason();

            if (apexSeason.Error) {
                console.error("/apexseason failed:", apexSeason.Error);
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Error")
                    .setColor(0xff0000)
                    .setDescription(
                        "Error occurred while fetching Apex Legends season data.",
                    );
                return interaction.editReply({ embeds: [errorEmbed] });
            }

            const startUnix = Math.floor(
                new Date(apexSeason.startDate).getTime() / 1000,
            );
            const endUnix = Math.floor(
                new Date(apexSeason.endDate).getTime() / 1000,
            );
            const nowUnix = Math.floor(Date.now() / 1000);
            const hasEnded = nowUnix >= endUnix;

            const seasonProgress = buildProgressBar(
                nowUnix - startUnix,
                endUnix - startUnix,
            );

            // The site only lists the next season once EA announces it.
            const endsValue = hasEnded
                ? `Ended <t:${endUnix}:R>. Next season info coming soon.`
                : `<t:${endUnix}:F> (<t:${endUnix}:R>)${apexSeason.estimated ? "\n*Estimated, EA hasn't confirmed the exact time yet*" : ""}`;

            const embed = new EmbedBuilder()
                .setTitle(":calendar: Apex Legends Season :calendar:")
                .setURL(apexSeason.url)
                .setColor(BRAND_COLORS.apex)
                .setDescription(
                    "Data from [apexseasons.online](https://apexseasons.online)",
                )
                .addFields(
                    {
                        name: "Current Season",
                        value: apexSeason.season,
                        inline: true,
                    },
                    {
                        name: "Name",
                        value: apexSeason.name,
                        inline: true,
                    },
                    {
                        name: "Season Progress",
                        value: seasonProgress,
                        inline: false,
                    },
                    {
                        name: hasEnded ? "Season Ended" : "Season Ends",
                        value: endsValue,
                        inline: false,
                    },
                )
                .setTimestamp()
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
