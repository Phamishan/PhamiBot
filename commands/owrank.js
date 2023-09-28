const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const getOverWatchPlayer = require("../controllers/searchForOverWatchPlayer");

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("owrank")
        .setDescription(
            "Finds overwatch profile, eg. Polar#21822 (RANK NEEDED)"
        )
        .addStringOption((option) =>
            option
                .setName("input")
                .setDescription("input to echo back")
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        // Wait for the users input and store that in const input
        const input = await interaction.options.get("input");

        const playerNameAndTag = input.value.split("#");
        let playerName = playerNameAndTag[0];
        let playerTag = playerNameAndTag[1];

        // Pass the input to the methods which is created in the controllers folder.
        const playerRank = await getOverWatchPlayer(playerName, playerTag);

        if (playerRank.status == "404") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription("Player not found");

            interaction.editReply({ embeds: [errorEmbed] });
        } else if (playerRank.status == "422") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription("Validation error");

            interaction.editReply({ embeds: [errorEmbed] });
        } else if (playerRank.status == "500") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription("Internal server error");

            interaction.editReply({ embeds: [errorEmbed] });
        } else if (playerRank.status == "504") {
            // Creating the embed
            const errorEmbed = new EmbedBuilder()
                .setTitle(`FEJL`)
                .setColor(0xff0000)
                .setDescription("Blizzard server error");

            interaction.editReply({ embeds: [errorEmbed] });
        } else {
            // Creating the embed
            const embed = new EmbedBuilder()
                .setTitle(
                    `:crown: ${playerRank.username}` +
                        "#" +
                        `${playerTag} :crown:`
                )
                .setColor(0xff0000)
                .addFields(
                    {
                        name: "Endorsement level:",
                        value: `${playerRank.endorsement.level}`,
                        inline: false,
                    },
                    {
                        name: "Damage rank:",
                        value: `${playerRank.competitive.pc.damage.division} + ${playerRank.competitive.pc.damage.tier} `,
                        inline: false,
                    },
                    {
                        name: "Support rank:",
                        value: `${playerRank.competitive.pc.support.division} + ${playerRank.competitive.pc.support.tier}`,
                        inline: false,
                    },
                    {
                        name: "Season:",
                        value: `${playerRank.competitive.pc.season}`,
                        inline: false,
                    }
                )
                .setThumbnail(`${playerRank.avatar}`)
                .setImage(`${playerRank.namecard}`)
                .setTimestamp()
                .setFooter({
                    text: "Created by @phamishan",
                    iconURL: "https://i.imgur.com/pcy4SD7.png",
                });

            // Replying with the embed
            interaction.editReply({ embeds: [embed] });
        }
    },
};
