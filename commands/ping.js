const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('sender pong tilbage'),
    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};