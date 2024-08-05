const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const getPlayerRank = require("../controllers/searchForPlayerRank.js");
const getPlayerInfoByPUUID = require("../controllers/searchForPlayerInfoByPUUID.js");
const getLastFiveMatches = require("../controllers/searchForLastFiveMatches.js");

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("me")
        .setDescription(
            "Finds YOUR Valorant profile (ONLY OG PLACEHOLDER & IN ORTUM)"
        ),

    async execute(interaction) {
        await interaction.deferReply();

        let puuid = "796c8a28-4293-5bbf-9183-5d95cdce243a";
        let playerName = "";
        let playerTag = "";
        let playerInfo = await getPlayerInfoByPUUID(puuid);

        if (interaction.user.id == "336187495978893312") {
            //Phamishan
            puuid = "796c8a28-4293-5bbf-9183-5d95cdce243a";
            playerInfo = await getPlayerInfoByPUUID(puuid);

            playerName = playerInfo.data.name;
            playerTag = playerInfo.data.tag;
        } else if (interaction.user.id == "242237129017524225") {
            //Laue
            puuid = "6176f10e-62ec-5845-8944-44a2225bda89";
            playerInfo = await getPlayerInfoByPUUID(puuid);

            playerName = playerInfo.data.name;
            playerTag = playerInfo.data.tag;
        } else if (interaction.user.id == "219518001366433792") {
            //Malthe
            puuid = "fa9712ff-bd06-5ed8-9afa-a82f930e656b";
            playerInfo = await getPlayerInfoByPUUID(puuid);

            playerName = playerInfo.data.name;
            playerTag = playerInfo.data.tag;
        } else if (interaction.user.id == "239122763095343104") {
            //Teis
            puuid = "b028b686-288d-526c-9c04-2c95be13e95b";
            playerInfo = await getPlayerInfoByPUUID(puuid);

            playerName = "Druumihra";
            playerTag = "Deity";
        } else if (interaction.user.id == "354319727859859458") {
            //Patrick
            puuid = "9851fa96-8b72-5f43-8bd0-5bba32e5fb09";
            playerInfo = await getPlayerInfoByPUUID(puuid);

            playerName = playerInfo.data.name;
            playerTag = playerInfo.data.tag;
        } else if (interaction.user.id == "303120606805622784") {
            //Jacob
            puuid = "13094cd6-3723-595e-8ff4-d0d718a4ed68";
            playerInfo = await getPlayerInfoByPUUID(puuid);

            playerName = playerInfo.data.name;
            playerTag = playerInfo.data.tag;
        } else if (interaction.user.id == "104310174105214976") {
            //Mathias
            puuid = "bed24b11-7de7-5a5e-98c4-49c677c6b2af";
            playerInfo = await getPlayerInfoByPUUID(puuid);

            playerName = playerInfo.data.name;
            playerTag = playerInfo.data.tag;
        } else if (interaction.user.id == "889501948410232842") {
            //Lucas
            puuid = "dcf5e34a-5d74-552b-bdeb-e97e3cbb7b80";
            playerInfo = await getPlayerInfoByPUUID(puuid);

            playerName = playerInfo.data.name;
            playerTag = playerInfo.data.tag;
        } else if (interaction.user.id == "469139107025780738") {
            //Anna
            puuid = "045af984-6086-5bcf-b18a-20fe69193639";
            playerInfo = await getPlayerInfoByPUUID(puuid);

            playerName = playerInfo.data.name;
            playerTag = playerInfo.data.tag;
        } else {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription("ikke en del af OG placeholder, unlucky");

            interaction.editReply({ embeds: [errorEmbed] });
        }

        // Pass the input to the methods which is created in the controllers folder.
        const playerRank = await getPlayerRank(playerName, playerTag);
        const playerMatches = await getLastFiveMatches(playerName, playerTag);

        if (playerRank.status == "404" || playerInfo.status == "404") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription(
                    "The entity was not found (player/match/general data)"
                );

            interaction.editReply({ embeds: [errorEmbed] });
        } else if (playerRank.status == "400" || playerInfo.status == "400") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription(
                    "Request error by the client (missing query for example)"
                );

            interaction.editReply({ embeds: [errorEmbed] });
        } else if (playerRank.status == "403" || playerInfo.status == "403") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription(
                    "Forbidden to connect to the Riot API (mainly maintenance reasons on riot side like patches) or to the HenrikDev API itself because of bot prevention for example"
                );

            interaction.editReply({ embeds: [errorEmbed] });
        } else if (playerRank.status == "408" || playerInfo.status == "408") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription("Timeout while fetching riot data");

            interaction.editReply({ embeds: [errorEmbed] });
        } else if (playerRank.status == "429" || playerInfo.status == "429") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription(
                    'Rate limit reached (can be global API limit which affects all users or just you, when the "x-ratelimit-remaining" header is 0 then its a personal limit)'
                );

            interaction.editReply({ embeds: [errorEmbed] });
        } else if (playerRank.status == "503" || playerInfo.status == "503") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription(
                    "Riot API seems to be down, API unable to connect"
                );

            interaction.editReply({ embeds: [errorEmbed] });
        } else {
            // Creating the embed
            const embed = new EmbedBuilder()
                .setTitle(
                    `:crown: ${playerInfo.data.name}` +
                        "#" +
                        `${playerInfo.data.tag} :crown:`
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
                    }
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
        }
    },
};
