const {
    SlashCommandBuilder,
    EmbedBuilder,
    InteractionContextType,
} = require("discord.js");

const { getCS2Stats } = require("../controllers/csRank.js");

// Helper function to extract Steam ID from Steam URL or convert profile name to Steam ID
const extractSteamId = async (input) => {
    // Check if input is a Steam URL
    const steamUrlMatch = input.match(
        /steamcommunity\.com\/(?:profiles|id)\/([a-zA-Z0-9]+)/,
    );

    if (steamUrlMatch) {
        let identifier = steamUrlMatch[1];

        console.log("Extracted identifier from URL:", identifier);

        // If it's a custom URL (vanity), we need to resolve it to Steam ID
        if (isNaN(identifier)) {
            try {
                const response = await fetch(
                    `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAM_API}&vanityurl=${identifier}&url_type=1`,
                );
                const data = await response.json();
                if (data.response && data.response.success === 1) {
                    return data.response.steamid;
                }
            } catch (error) {
                return null;
            }
        }
        return identifier;
    }

    // If input looks like a Steam ID (digits), return as is
    if (/^\d+$/.test(input)) {
        return input;
    }

    // Try to resolve as a vanity URL (profile name)
    try {
        const response = await fetch(
            `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAM_API}&vanityurl=${input}&url_type=1`,
        );
        const data = await response.json();
        if (data.response && data.response.success === 1) {
            return data.response.steamid;
        }
    } catch (error) {
        console.error("Error resolving vanity URL:", error);
    }

    return null;
};

// Get Steam player summary
const getSteamPlayerSummary = async (steamId) => {
    try {
        const response = await fetch(
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API}&steamids=${steamId}&format=json`,
        );
        const data = await response.json();
        return data.response.players[0] || null;
    } catch (error) {
        return null;
    }
};

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("csrank")
        .setDescription("Finds CS2 profile by Steam URL or Steam ID")
        .addStringOption((option) =>
            option
                .setName("input")
                .setDescription("Steam profile URL or Steam ID")
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

            // Extract Steam ID from input
            const steamId = await extractSteamId(input);

            if (!steamId) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Error")
                    .setColor(0xff0000)
                    .setDescription(
                        "Invalid input. Please provide a valid Steam profile URL (e.g., https://steamcommunity.com/profiles/76561198xxx) or Steam ID.",
                    );
                return interaction.editReply({ embeds: [errorEmbed] });
            }

            // Fetch Steam player data and CS2 stats
            const playerSummary = await getSteamPlayerSummary(steamId);
            const csStats = await getCS2Stats(steamId);

            if (!playerSummary) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Error")
                    .setColor(0xff0000)
                    .setDescription("Steam profile not found or is private.");
                return interaction.editReply({ embeds: [errorEmbed] });
            }

            // Create the embed for successful response
            const embed = new EmbedBuilder()
                .setTitle(
                    `:crossed_swords: ${playerSummary.personaname} :crossed_swords:`,
                )
                .setColor(0x2a3f5f)
                .addFields(
                    {
                        name: "Steam Profile:",
                        value: `[${playerSummary.personaname}](${playerSummary.profileurl})`,
                        inline: false,
                    },
                    {
                        name: "Status:",
                        value:
                            playerSummary.personastate === 0
                                ? "Offline"
                                : playerSummary.personastate === 1
                                  ? "Online"
                                  : "Away",
                        inline: true,
                    },
                    {
                        name: "Last Online:",
                        value: `<t:${Math.floor(playerSummary.lastlogoff)}:R>`, // Relative time format
                        inline: true,
                    },
                );

            // Add CS2 stats if available
            if (csStats.status === 200) {
                embed.addFields(
                    {
                        name: "CS2 Stats:",
                        value: `${csStats.data.ranks.premier}`,
                        inline: false,
                    },
                    {
                        name: "Wingman Rank:",
                        value: csStats.data.ranks.wingman
                            ? `${csStats.data.ranks.wingman}`
                            : "Not ranked",
                        inline: false,
                    },
                    {
                        name: "Faceit Level:",
                        value: csStats.data.ranks.faceit
                            ? `${csStats.data.ranks.faceit}`
                            : "Not ranked",
                        inline: false,
                    },
                    {
                        name: "Faceit Elo:",
                        value: csStats.data.ranks.faceit_elo
                            ? `${csStats.data.ranks.faceit_elo}`
                            : "Not ranked",
                        inline: false,
                    },
                );
            } else {
                embed.addFields({
                    name: "CS2 Data:",
                    value: "No CS2 ranked data found or account not linked.",
                    inline: false,
                });
            }

            embed
                .setThumbnail(playerSummary.avatarmedium)
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
