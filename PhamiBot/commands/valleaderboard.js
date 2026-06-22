const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    InteractionContextType,
    ComponentType,
} = require("discord.js");

const getPlayerRank = require("../controllers/playerRank.js");
const getPlayerInfoByPUUID = require("../controllers/playerInfoByPUUID.js");

const PAGE_SIZE = 5;

const rankBaseIndex = {
    iron: 0,
    bronze: 3,
    silver: 6,
    gold: 9,
    platinum: 12,
    diamond: 15,
    ascendant: 18,
    immortal: 21,
    radiant: 24,
};

function normalizeUUIDs(rawInput) {
    return [
        ...new Set(
            rawInput
                .split(",")
                .map((uuid) => uuid.trim())
                .filter((uuid) => uuid.length > 0),
        ),
    ];
}

function parseTierFromName(rankName) {
    if (!rankName) return 0;

    const lowered = rankName.toLowerCase();

    if (lowered.includes("unrated") || lowered.includes("unranked")) {
        return 0;
    }

    const rankKey = Object.keys(rankBaseIndex).find((key) =>
        lowered.includes(key),
    );

    if (!rankKey) return 0;

    let division = 1;
    if (lowered.includes("iii")) division = 3;
    else if (lowered.includes("ii")) division = 2;

    // Radiant has no division but should always be above Immortal 3.
    if (rankKey === "radiant") {
        return 25;
    }

    return rankBaseIndex[rankKey] + division;
}

function getRankScore(playerRank) {
    const currentData = playerRank?.data?.current_data;
    if (!currentData) return -1;

    const tier =
        Number(currentData.currenttier) ||
        parseTierFromName(currentData.currenttierpatched);
    if (!tier || Number.isNaN(tier)) return -1;

    const rr = Number(currentData.ranking_in_tier) || 0;
    return tier * 100 + rr;
}

function formatPlayerLine(player, indexOffset) {
    const placement = indexOffset + 1;
    const rank = player.rankName || "Unranked";
    const rrSuffix = player.score >= 0 ? ` (${player.rr} RR)` : "";

    return `**${placement}. ${player.riotName}**\n${rank}${rrSuffix}`;
}

function getDetailedPlayerEmbed(player) {
    const embed = new EmbedBuilder()
        .setTitle(`:crown: ${player.riotName} :crown:`)
        .setColor(0xff0000)
        .addFields(
            {
                name: "Account level:",
                value: `${player.accountLevel}`,
                inline: false,
            },
            {
                name: "Rank:",
                value: `${player.rankName}`,
                inline: true,
            },
            {
                name: "RR:",
                value: `${player.rr}`,
                inline: true,
            },
        )
        .setTimestamp()
        .setFooter({
            text: "Created by @phamishan",
            iconURL: "https://i.imgur.com/sNTzfld.jpg",
        });

    if (player.cardImage) {
        embed.setImage(player.cardImage);
    }
    if (player.rankImage) {
        embed.setThumbnail(player.rankImage);
    }

    return embed;
}

function getPageEmbed(sortedPlayers, page) {
    const totalPages = Math.ceil(sortedPlayers.length / PAGE_SIZE);
    const start = page * PAGE_SIZE;
    const pagePlayers = sortedPlayers.slice(start, start + PAGE_SIZE);

    const embed = new EmbedBuilder()
        .setTitle(":trophy: VALORANT Leaderboard")
        .setDescription(
            "Sorted by highest rank. Click a player to view details.",
        )
        .setColor(0xff0000)
        .addFields({
            name: "Players",
            value: pagePlayers
                .map((player, index) => formatPlayerLine(player, start + index))
                .join("\n\n"),
            inline: false,
        })
        .setTimestamp()
        .setFooter({
            text: `Page ${page + 1}/${totalPages} | Created by @phamishan`,
            iconURL: "https://i.imgur.com/sNTzfld.jpg",
        });

    return embed;
}

function getPlayerButtonsRow(sortedPlayers, page) {
    const start = page * PAGE_SIZE;
    const pagePlayers = sortedPlayers.slice(start, start + PAGE_SIZE);
    const buttons = pagePlayers.map((player, index) => {
        const buttonIndex = start + index;
        return new ButtonBuilder()
            .setCustomId(`valleaderboard_player_${buttonIndex}`)
            .setLabel(`${buttonIndex + 1}. ${player.riotName.split("#")[0]}`)
            .setStyle(ButtonStyle.Secondary);
    });

    return new ActionRowBuilder().addComponents(buttons);
}

function getPaginationRow(page, totalPages) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("valleaderboard_prev")
            .setLabel("Previous")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
        new ButtonBuilder()
            .setCustomId("valleaderboard_next")
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page >= totalPages - 1),
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("valleaderboard")
        .setDescription("Ranks all friends by highest VALORANT rank")
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const uuids = [
            "796c8a28-4293-5bbf-9183-5d95cdce243a", // Phami
            "6176f10e-62ec-5845-8944-44a2225bda89", // Laue
            "9851fa96-8b72-5f43-8bd0-5bba32e5fb09", // Patrick
            "fa9712ff-bd06-5ed8-9afa-a82f930e656b", // Malthe
            "bed24b11-7de7-5a5e-98c4-49c677c6b2af", // Mathias
            "9aee3e0d-1bd1-5ece-9fed-c6843e11282a", // Benjamin
            "13094cd6-3723-595e-8ff4-d0d718a4ed68", // Jacob
            "dcf5e34a-5d74-552b-bdeb-e97e3cbb7b80", // Lucas
            "da93f7f7-9b4f-5f78-bc16-729fac3de2fe", // Mikkel
            "x",
        ];

        if (uuids.length === 0) {
            return interaction.editReply(
                "Please provide at least one valid UUID.",
            );
        }

        const players = await Promise.all(
            uuids.map(async (uuid) => {
                const playerInfo = await getPlayerInfoByPUUID(uuid);

                if (playerInfo?.status !== 200 || !playerInfo?.data) {
                    return {
                        riotName: `Unknown (${uuid.slice(0, 8)}...)`,
                        rankName: "Unavailable",
                        rr: 0,
                        score: -1,
                        accountLevel: 0,
                        cardImage: null,
                        rankImage: null,
                    };
                }

                const riotName = `${playerInfo.data.name}#${playerInfo.data.tag}`;
                const playerRank = await getPlayerRank(
                    playerInfo.data.name,
                    playerInfo.data.tag,
                );

                if (
                    playerRank?.status !== 200 ||
                    !playerRank?.data?.current_data
                ) {
                    return {
                        riotName,
                        rankName: "Unranked",
                        rr: 0,
                        score: -1,
                        accountLevel: playerInfo.data.account_level || 0,
                        cardImage: playerInfo.data.card?.wide || null,
                        rankImage: null,
                    };
                }

                const currentData = playerRank.data.current_data;
                return {
                    riotName,
                    rankName: currentData.currenttierpatched || "Unranked",
                    rr: Number(currentData.ranking_in_tier) || 0,
                    score: getRankScore(playerRank),
                    accountLevel: playerInfo.data.account_level || 0,
                    cardImage: playerInfo.data.card?.wide || null,
                    rankImage: currentData.images?.small || null,
                };
            }),
        );

        const sortedPlayers = players.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.riotName.localeCompare(b.riotName);
        });

        if (sortedPlayers.length === 0) {
            return interaction.editReply(
                "No players found for the provided UUIDs.",
            );
        }

        let currentPage = 0;
        const totalPages = Math.ceil(sortedPlayers.length / PAGE_SIZE);

        const initialPayload = {
            embeds: [getPageEmbed(sortedPlayers, currentPage)],
            components: [
                getPlayerButtonsRow(sortedPlayers, currentPage),
                ...(totalPages > 1
                    ? [getPaginationRow(currentPage, totalPages)]
                    : []),
            ],
        };

        const response = await interaction.editReply(initialPayload);

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 120000,
            filter: (buttonInteraction) =>
                buttonInteraction.user.id === interaction.user.id,
        });

        collector.on("collect", async (buttonInteraction) => {
            if (buttonInteraction.customId === "valleaderboard_prev") {
                currentPage = Math.max(0, currentPage - 1);
                await buttonInteraction.update({
                    embeds: [getPageEmbed(sortedPlayers, currentPage)],
                    components: [
                        getPlayerButtonsRow(sortedPlayers, currentPage),
                        ...(totalPages > 1
                            ? [getPaginationRow(currentPage, totalPages)]
                            : []),
                    ],
                });
            } else if (buttonInteraction.customId === "valleaderboard_next") {
                currentPage = Math.min(totalPages - 1, currentPage + 1);
                await buttonInteraction.update({
                    embeds: [getPageEmbed(sortedPlayers, currentPage)],
                    components: [
                        getPlayerButtonsRow(sortedPlayers, currentPage),
                        ...(totalPages > 1
                            ? [getPaginationRow(currentPage, totalPages)]
                            : []),
                    ],
                });
            } else if (
                buttonInteraction.customId.startsWith("valleaderboard_player_")
            ) {
                const playerIndex = parseInt(
                    buttonInteraction.customId.split("_")[2],
                );
                const player = sortedPlayers[playerIndex];
                await buttonInteraction.reply({
                    embeds: [getDetailedPlayerEmbed(player)],
                    ephemeral: true,
                });
            }
        });

        collector.on("end", async () => {
            try {
                await interaction.editReply({
                    components: [
                        getPlayerButtonsRow(sortedPlayers, currentPage),
                        ...(totalPages > 1
                            ? [
                                  new ActionRowBuilder().addComponents(
                                      new ButtonBuilder()
                                          .setCustomId(
                                              "valleaderboard_prev_disabled",
                                          )
                                          .setLabel("Previous")
                                          .setStyle(ButtonStyle.Secondary)
                                          .setDisabled(true),
                                      new ButtonBuilder()
                                          .setCustomId(
                                              "valleaderboard_next_disabled",
                                          )
                                          .setLabel("Next")
                                          .setStyle(ButtonStyle.Primary)
                                          .setDisabled(true),
                                  ),
                              ]
                            : []),
                    ].map((row) =>
                        row.components.forEach((btn) => btn.setDisabled(true))
                            ? row
                            : row,
                    ),
                });
            } catch (error) {
                // Message may already be deleted or unavailable.
            }
        });
    },

    async handlePlayerDetail(interaction, playerIndex, sortedPlayers) {
        const player = sortedPlayers[playerIndex];
        await interaction.reply({
            embeds: [getDetailedPlayerEmbed(player)],
            ephemeral: true,
        });
    },
};
