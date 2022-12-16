const { SlashCommandBuilder } = require('discord.js');

var pics = [{ files: ["pics/AddisonRae1.jpg"] }, { files: ["pics/AddisonRae2.png"] }, { files: ["pics/AddisonRae3.png"] }];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('patrick')
        .setDescription('Hvad mon det her er??'),

    async execute(interaction) {
        await interaction.reply(pics[Math.floor(Math.random() * pics.length)]);
    },
};