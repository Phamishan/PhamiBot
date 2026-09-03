const {
    SlashCommandBuilder,
    EmbedBuilder,
    InteractionContextType,
} = require("discord.js");

const getPlayerRank = require("../controllers/playerRank.js");
const getPlayerInfoByPUUID = require("../controllers/playerInfoByPUUID.js");
const getRankHistory = require("../controllers/rankHistory.js");
const getRecentMatches = require("../controllers/recentMatches.js");
const {
    getValorantRankColor,
    buildRankHistoryText,
    buildRrBar,
} = require("../utils/embedStyle.js");

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("me")
        .setDescription(
            "Finds YOUR VALORANT profile (ONLY OG PLACEHOLDER & PREMIUMHOLDERS)",
        )
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
        ),

    async execute(interaction) {
        await interaction.deferReply();

        let puuid = "796c8a28-4293-5bbf-9183-5d95cdce243a";
        let playerName = "";
        let playerTag = "";
        let playerInfo = await getPlayerInfoByPUUID(puuid);

        const userMapping = {
            "354319727859859458": {
                puuid: "9851fa96-8b72-5f43-8bd0-5bba32e5fb09",
            }, // Patrick
            "336187495978893312": {
                puuid: "796c8a28-4293-5bbf-9183-5d95cdce243a",
            }, // Phamishan
            "242237129017524225": {
                puuid: "6176f10e-62ec-5845-8944-44a2225bda89",
            }, // Laue
            "104310174105214976": {
                puuid: "bed24b11-7de7-5a5e-98c4-49c677c6b2af",
            }, // Mathias
            "219518001366433792": {
                puuid: "fa9712ff-bd06-5ed8-9afa-a82f930e656b",
            }, // Malthe
            "693130776778113114": {
                puuid: "9d934de8-d758-5ebf-a098-b139f4057e75",
            }, // Julie
            "303120606805622784": {
                puuid: "13094cd6-3723-595e-8ff4-d0d718a4ed68",
            }, // Jacob
            "763469137351540767": {
                puuid: "9aee3e0d-1bd1-5ece-9fed-c6843e11282a",
            }, // Benjamin
        };

        const userInfo = userMapping[interaction.user.id];

        if (userInfo) {
            puuid = userInfo.puuid;
            playerInfo = await getPlayerInfoByPUUID(puuid);

            playerName = userInfo.name || playerInfo.data.name;
            playerTag = userInfo.tag || playerInfo.data.tag;
        } else {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`Error`)
                .setColor(0xff0000)
                .setDescription("ikke en del af OG placeholder, unlucky");

            return interaction.editReply({ embeds: [errorEmbed] });
        }

        // Pass the input to the methods which is created in the controllers folder.
        const playerRank = await getPlayerRank(playerName, playerTag);
        const rankHistory = await getRankHistory(playerName, playerTag);
        const recentMatches = await getRecentMatches(playerName, playerTag);

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
            rankHistory.status,
        ].find((status) => errorMessages[status]);

        if (errorStatus) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("Error")
                .setColor(0xff0000)
                .setDescription(errorMessages[errorStatus]);
            return interaction.editReply({ embeds: [errorEmbed] });
        }
        // Creating the embed
        const rankTier = playerRank.data.current_data.currenttierpatched;
        const rr = playerRank.data.current_data.ranking_in_tier;
        const rrBar = buildRrBar(rankTier, rr);
        const embed = new EmbedBuilder()
            .setTitle(
                `:crown: ${playerInfo.data.name}` +
                    "#" +
                    `${playerInfo.data.tag} :crown:`,
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
            .setImage(`${playerInfo.data.card.wide}`)
            .setThumbnail(`${playerRank.data.current_data.images.small}`)
            .setTimestamp()
            .setFooter({
                text: "Created by @phamishan",
                iconURL: "https://i.imgur.com/sNTzfld.jpg",
            });
        // Replying with the embed
        interaction.editReply({ embeds: [embed] });
    },
};
