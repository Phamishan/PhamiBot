const {
    SlashCommandBuilder,
    EmbedBuilder,
    InteractionContextType,
} = require("discord.js");

const { getServerStatus } = require("../controllers/apexServers.js");
const { getApexErrorMessage } = require("../controllers/apexApi.js");

const SERVICES = [
    { key: "Origin_login", label: "Origin Login" },
    { key: "EA_novafusion", label: "EA Novafusion" },
    { key: "EA_accounts", label: "EA Accounts" },
    { key: "ApexOauth_Crossplay", label: "Crossplay Auth" },
    { key: "otherPlatforms", label: "Console Networks" },
];

const STATUS_EMOJI = {
    UP: ":green_circle:",
    SLOW: ":yellow_circle:",
    DOWN: ":red_circle:",
};

const STATUS_COLORS = {
    UP: 0x36c17a,
    SLOW: 0xe8c04c,
    DOWN: 0xd23b3b,
};

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("apexstatus")
        .setDescription("Shows the Apex Legends server status")
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply(); // Ensure the interaction is deferred

            // Fetch data from API
            const serverStatus = await getServerStatus();

            if (serverStatus.Error) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Error")
                    .setColor(0xff0000)
                    .setDescription(getApexErrorMessage(serverStatus.status));
                return interaction.editReply({ embeds: [errorEmbed] });
            }

            // Worst status across every region sets the embed color.
            let worstStatus = "UP";

            const embed = new EmbedBuilder()
                .setTitle(":satellite: Apex Server Status :satellite:")
                .setURL("https://apexlegendsstatus.com")
                .setDescription(
                    "Data from [apexlegendsstatus.com](https://apexlegendsstatus.com)",
                )
                .setTimestamp()
                .setFooter({
                    text: "Created by @phamishan",
                    iconURL:
                        "https://raw.githubusercontent.com/Phamishan/PhamiBot/development/PhamiBot/pics/phamibot-avatar.png",
                });

            for (const { key, label } of SERVICES) {
                const regions = serverStatus[key];
                if (!regions) continue;

                const lines = Object.entries(regions).map(([region, info]) => {
                    const status = info?.Status ?? "UNKNOWN";
                    if (status === "DOWN") worstStatus = "DOWN";
                    else if (status === "SLOW" && worstStatus === "UP")
                        worstStatus = "SLOW";

                    const emoji = STATUS_EMOJI[status] ?? ":white_circle:";
                    return `${emoji} ${region.replace(/-/g, " ")}`;
                });

                embed.addFields({
                    name: label,
                    value: lines.join("\n"),
                    inline: true,
                });
            }

            embed.setColor(STATUS_COLORS[worstStatus]);

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
