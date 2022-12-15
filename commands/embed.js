const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const embed = new EmbedBuilder().setColor(0x0099FF).setTitle('Hello World!');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Lets test out our awesome new embed!'),
    async execute(interaction) {
        await interaction.reply({ embeds: [embed] });
    },
};