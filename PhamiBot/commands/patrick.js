const { SlashCommandBuilder } = require("discord.js");

const filePath = "pics/addisonRae/";

var pics = [
    { files: [filePath + "addisonRae1.jpg"] },
    { files: [filePath + "addisonRae2.png"] },
    { files: [filePath + "addisonRae3.png"] },
    { files: [filePath + "addisonRae4.jpg"] },
    { files: [filePath + "addisonRae5.jpg"] },
    { files: [filePath + "addisonRae6.jpg"] },
    { files: [filePath + "addisonRae7.jpg"] },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("patrick")
        .setDescription("Hvad mon det her er??"),

    async execute(interaction) {
        await interaction.reply(pics[Math.floor(Math.random() * pics.length)]);
    },
};
