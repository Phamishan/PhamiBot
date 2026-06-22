const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    InteractionContextType,
    ComponentType,
} = require("discord.js");

const getPlayerInfoByPUUID = require("../controllers/playerInfoByPUUID.js");

const PAGE_SIZE = 5;

const getMatchHistory = async (name, tag) => {
    try {
        const data = await fetch(
            `https://api.henrikdev.xyz/valorant/v3/matches/eu/${name}/${tag}?mode=competitive&size=10`,
            {
                headers: {
                    ACCEPT: "application/vnd.api+json",
                    Authorization: process.env.VL_API,
                },
            },
        );
        return await data.json();
    } catch (error) {
        return { status: 400, error: error };
    }
};

function parseMatchData(match, playerName) {
    const allPlayers = match.players.all_players;
    const lowercase = JSON.parse(JSON.stringify(allPlayers).toLowerCase());

    const player = lowercase.find((p) => p.name === playerName.toLowerCase());

    if (!player) return null;

    const playerTeam = player.team;
    const teamData = playerTeam === "blue" ? match.teams.blue : match.teams.red;
    const opponentTeamData =
        playerTeam === "blue" ? match.teams.red : match.teams.blue;

    const isWin = teamData.has_won;
    const rrChange = player.tier_after - player.tier_before;

    // Find original player (case-sensitive)
    const originalPlayer = allPlayers.find(
        (p) => p.name.toLowerCase() === playerName.toLowerCase(),
    );

    return {
        map: match.metadata.map,
        agent: originalPlayer?.character || "Unknown",
        isWin,
        kda: `${originalPlayer?.stats.kills}/${originalPlayer?.stats.deaths}/${originalPlayer?.stats.assists}`,
        kills: originalPlayer?.stats.kills || 0,
        deaths: originalPlayer?.stats.deaths || 0,
        assists: originalPlayer?.stats.assists || 0,
        rrBefore: player.tier_before,
        rrAfter: player.tier_after,
        rrChange,
        result: isWin ? "WIN" : "LOSS",
        roundsWon: teamData.rounds_won,
        roundsLost: opponentTeamData.rounds_won,
        matchDate: new Date(match.metadata.game_start_patched),
    };
}

function getMatchEmbed(playerRiotName, matches, page) {
    const totalPages = Math.ceil(matches.length / PAGE_SIZE);
    const start = page * PAGE_SIZE;
    const pageMatches = matches.slice(start, start + PAGE_SIZE);

    const embed = new EmbedBuilder()
        .setTitle(`:crossed_swords: ${playerRiotName} - Match History`)
        .setColor(0xff0000)
        .setDescription(
            pageMatches
                .map((match, index) => {
                    const placement = start + index + 1;
                    const resultEmoji = match.isWin
                        ? ":green_square:"
                        : ":red_square:";
                    const rrColor =
                        match.rrChange > 0
                            ? "📈"
                            : match.rrChange < 0
                              ? "📉"
                              : "";
                    const rrStr =
                        match.rrChange > 0
                            ? `+${match.rrChange}`
                            : `${match.rrChange}`;

                    return (
                        `**${placement}. ${resultEmoji} ${match.result} vs ${match.roundsWon}-${match.roundsLost}**\n` +
                        `Map: \`${match.map}\` | Agent: \`${match.agent}\`\n` +
                        `KDA: **${match.kda}** | RR: ${match.rrBefore} → ${match.rrAfter} ${rrColor} \`${rrStr}\`\n` +
                        `<t:${Math.floor(match.matchDate.getTime() / 1000)}:R>`
                    );
                })
                .join("\n\n"),
        )
        .setTimestamp()
        .setFooter({
            text: `Page ${page + 1}/${totalPages} | Created by @phamishan`,
            iconURL: "https://i.imgur.com/sNTzfld.jpg",
        });

    return embed;
}

function getPaginationRow(page, totalPages) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("matches_prev")
            .setLabel("Previous")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
        new ButtonBuilder()
            .setCustomId("matches_next")
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page >= totalPages - 1),
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("matches")
        .setDescription("View last 10 competitive VALORANT matches")
        .addStringOption((option) =>
            option
                .setName("player")
                .setDescription(
                    "Player PUUID (or leave blank for list of friends)",
                )
                .setRequired(false),
        )
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const playerArg = interaction.options.getString("player");

        // List of friend UUIDs from valleaderboard
        const uuids = playerArg
            ? [playerArg]
            : [
                  "796c8a28-4293-5bbf-9183-5d95cdce243a", // Phami
                  "6176f10e-62ec-5845-8944-44a2225bda89", // Laue
                  "9851fa96-8b72-5f43-8bd0-5bba32e5fb09", // Patrick
                  "fa9712ff-bd06-5ed8-9afa-a82f930e656b", // Malthe
                  "bed24b11-7de7-5a5e-98c4-49c677c6b2af", // Mathias
                  "9aee3e0d-1bd1-5ece-9fed-c6843e11282a", // Benjamin
                  "13094cd6-3723-595e-8ff4-d0d718a4ed68", // Jacob
                  "dcf5e34a-5d74-552b-bdeb-e97e3cbb7b80", // Lucas
                  "da93f7f7-9b4f-5f78-bc16-729fac3de2fe", // Mikkel
              ];

        // If no player specified, show selection
        if (!playerArg && uuids.length > 0) {
            const playerInfo = await getPlayerInfoByPUUID(uuids[0]);
            if (playerInfo?.status === 200 && playerInfo?.data) {
                const initialPlayer = `${playerInfo.data.name}#${playerInfo.data.tag}`;

                // Fetch matches for first player
                const matchResponse = await getMatchHistory(
                    playerInfo.data.name,
                    playerInfo.data.tag,
                );

                if (!matchResponse.data || matchResponse.data.length === 0) {
                    return interaction.editReply(
                        "No match history found for this player.",
                    );
                }

                const parsedMatches = matchResponse.data
                    .map((m) => parseMatchData(m, playerInfo.data.name))
                    .filter((m) => m !== null);

                if (parsedMatches.length === 0) {
                    return interaction.editReply("Could not parse match data.");
                }

                let currentPage = 0;
                const totalPages = Math.ceil(parsedMatches.length / PAGE_SIZE);

                const initialPayload = {
                    embeds: [
                        getMatchEmbed(
                            initialPlayer,
                            parsedMatches,
                            currentPage,
                        ),
                    ],
                    components:
                        totalPages > 1
                            ? [getPaginationRow(currentPage, totalPages)]
                            : [],
                };

                const response = await interaction.editReply(initialPayload);

                if (totalPages > 1) {
                    const collector = response.createMessageComponentCollector({
                        componentType: ComponentType.Button,
                        time: 120000,
                        filter: (buttonInteraction) =>
                            buttonInteraction.user.id === interaction.user.id,
                    });

                    collector.on("collect", async (buttonInteraction) => {
                        if (buttonInteraction.customId === "matches_prev") {
                            currentPage = Math.max(0, currentPage - 1);
                        } else if (
                            buttonInteraction.customId === "matches_next"
                        ) {
                            currentPage = Math.min(
                                totalPages - 1,
                                currentPage + 1,
                            );
                        }

                        await buttonInteraction.update({
                            embeds: [
                                getMatchEmbed(
                                    initialPlayer,
                                    parsedMatches,
                                    currentPage,
                                ),
                            ],
                            components: [
                                getPaginationRow(currentPage, totalPages),
                            ],
                        });
                    });

                    collector.on("end", () => {
                        // Collector ended
                    });
                }
            }
        }
    },
};
