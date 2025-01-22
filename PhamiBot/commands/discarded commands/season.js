const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const getSeason = require("./searchForSeason.js");

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("season")
        .setDescription("Shows a countdown for when the season ends"),

    async execute(interaction) {
        await interaction.deferReply();

        const embed = new EmbedBuilder()
            .setTitle(
                `:crown: ${teamInfo.data.name}` +
                    "#" +
                    `${teamInfo.data.tag} :crown:`
            )
            .setColor(0xff0000)
            .addFields({
                name: "Wins:",
                value: `${teamInfo.data.stats.wins}`,
            })
            .setTimestamp()
            .setFooter({
                text: "Created by @phamishan",
                iconURL: "https://i.imgur.com/sNTzfld.jpg",
            });

        // Replying with the embed
        await interaction.editReply({ embeds: [embed] });
    },
};
