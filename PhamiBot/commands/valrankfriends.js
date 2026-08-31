const {
    SlashCommandBuilder,
    EmbedBuilder,
    InteractionContextType,
} = require("discord.js");

const getPlayerRank = require("../controllers/playerRank.js");
const getPlayerInfoByPUUID = require("../controllers/playerInfoByPUUID.js");
const getLastFiveMatches = require("../controllers/lastFiveMatches.js");

let playerName = "";
let playerTag = "";

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("valrankfriends")
        .setDescription(
            "Finds VALORANT profile (ONLY OG PLACEHOLDER & PREMIUMHOLDERS)",
        )
        .addStringOption((option) =>
            option
                .setName("input")
                .setDescription("Choose one from the list")
                .setRequired(true)
                .addChoices(
                    {
                        name: "POLAR",
                        value: "9851fa96-8b72-5f43-8bd0-5bba32e5fb09",
                    },
                    {
                        name: "PH4M1",
                        value: "796c8a28-4293-5bbf-9183-5d95cdce243a",
                    },
                    {
                        name: "MEEJI",
                        value: "6176f10e-62ec-5845-8944-44a2225bda89",
                    },
                    {
                        name: "PATTECARMY",
                        value: "bed24b11-7de7-5a5e-98c4-49c677c6b2af",
                    },
                    {
                        name: "RUBGOOSE",
                        value: "fa9712ff-bd06-5ed8-9afa-a82f930e656b",
                    },
                    {
                        name: "SWEETPOISON",
                        value: "9d934de8-d758-5ebf-a098-b139f4057e75",
                    },
                    {
                        name: "Z1LVER",
                        value: "9aee3e0d-1bd1-5ece-9fed-c6843e11282a",
                    },
                    {
                        name: "PRAY2SLAY",
                        value: "13094cd6-3723-595e-8ff4-d0d718a4ed68",
                    },
                ),
        )
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const input = await interaction.options.get("input");

        // Wait for the users input and store that in const input
        let playerInfo = await getPlayerInfoByPUUID(input.value);

        playerName = playerInfo.data.name;
        playerTag = playerInfo.data.tag;

        // Pass the input to the methods which is created in the controllers folder.
        const playerRank = await getPlayerRank(playerName, playerTag);
        const playerMatches = await getLastFiveMatches(playerName, playerTag);

        const errorMessages = {
            404: "The entity was not found (player/match/general data)",
            400: "Request error by the client (missing query for example)",
            403: "Forbidden to connect to the Riot API (mainly maintenance reasons on Riot's side like patches) or to the HenrikDev API itself because of bot prevention for example",
            408: "Timeout while fetching Riot data",
            429: 'Rate limit reached (can be global API limit which affects all users or just you, when the "x-ratelimit-remaining" header is 0 then it’s a personal limit)',
            503: "Riot API seems to be down, API unable to connect",
        };

        const errorStatus = [playerRank.status, playerInfo.status].find(
            (status) => errorMessages[status],
        );

        if (errorStatus) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("Error")
                .setColor(0xff0000)
                .setDescription(errorMessages[errorStatus]);
            return interaction.editReply({ embeds: [errorEmbed] });
        }
        // Creating the embed
        const embed = new EmbedBuilder()
            .setTitle(
                `:crown: ${playerInfo.data.name}` +
                    "#" +
                    `${playerInfo.data.tag} :crown:`,
            )
            .setColor(0xff0000)
            .addFields(
                {
                    name: "Account level:",
                    value: `${playerInfo.data.account_level}`,
                    inline: false,
                },
                {
                    name: "Rank:",
                    value: `${playerRank.data.current_data.currenttierpatched}`,
                    inline: true,
                },
                {
                    name: "RR:",
                    value: `${playerRank.data.current_data.ranking_in_tier}`,
                    inline: true,
                },
                {
                    name: "Last 5 ranked games:",
                    value: `${playerMatches}`,
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
