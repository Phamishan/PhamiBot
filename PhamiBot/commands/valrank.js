const {
    SlashCommandBuilder,
    EmbedBuilder,
    InteractionContextType,
} = require("discord.js");

const getPlayerRank = require("../controllers/playerRank.js");
const getPlayerInfo = require("../controllers/playerInfo.js");
const getRankHistory = require("../controllers/rankHistory.js");
const getRecentMatches = require("../controllers/recentMatches.js");
const getPlayerCard = require("../controllers/playerCard.js");
const {
    getValorantRankColor,
    buildRankHistoryText,
    buildRrBar,
} = require("../utils/embedStyle.js");

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("valrank")
        .setDescription("Finds VALORANT profile, e.g. PH4M1#SH4N")
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

            const input = interaction.options.get("input");
            const playerNameAndTag = input.value.split("#");
            const playerName = playerNameAndTag[0];
            const playerTag = playerNameAndTag[1];

            // Fetch data from APIs
            const playerRank = await getPlayerRank(playerName, playerTag);
            const playerInfo = await getPlayerInfo(playerName, playerTag);
            const rankHistory = await getRankHistory(playerName, playerTag);
            const recentMatches = await getRecentMatches(
                playerName,
                playerTag,
            );
            const playerCard = await getPlayerCard(playerInfo.data.card);

            const errorMessages = {
                404: "The entity was not found (player/match/general data)",
                400: "Request error by the client (missing query for example)",
                403: "Forbidden to connect to the Riot API (mainly maintenance reasons on Riot's side like patches) or to the HenrikDev API itself because of bot prevention for example",
                408: "Timeout while fetching Riot data",
                429: 'Rate limit reached (can be global API limit which affects all users or just you, when the "x-ratelimit-remaining" header is 0 then it’s a personal limit)',
                503: "Riot API seems to be down, API unable to connect",
            };

            const errorStatus = [
                playerRank.status,
                playerInfo.status,
                playerCard.status,
                rankHistory.status,
            ].find((status) => errorMessages[status]);

            if (errorStatus) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Error")
                    .setColor(0xff0000)
                    .setDescription(errorMessages[errorStatus]);
                return interaction.editReply({ embeds: [errorEmbed] });
            }

            // Create the embed for successful response
            const rankTier = playerRank.data.current_data.currenttierpatched;
            const rr = playerRank.data.current_data.ranking_in_tier;
            const rrBar = buildRrBar(rankTier, rr);
            const embed = new EmbedBuilder()
                .setTitle(
                    `:crown: ${playerInfo.data.name}#${playerInfo.data.tag} :crown:`,
                )
                .setColor(getValorantRankColor(rankTier))
                .addFields(
                    {
                        name: "Account level",
                        value: `${playerInfo.data.account_level}`,
                        inline: false,
                    },
                    {
                        name: "Rank",
                        value: `${rankTier}`,
                        inline: true,
                    },
                    {
                        name: "RR",
                        value: rrBar ? `${rrBar} ${rr} RR` : `${rr} RR`,
                        inline: true,
                    },
                    {
                        name: "Last 5 ranked games",
                        value: buildRankHistoryText(
                            rankHistory.data,
                            recentMatches.data,
                            playerName,
                        ),
                        inline: false,
                    },
                )
                .setImage(`${playerCard.data.wideArt}`)
                .setThumbnail(`${playerRank.data.current_data.images.small}`)
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
