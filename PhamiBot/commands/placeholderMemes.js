const { SlashCommandBuilder } = require("discord.js");

const filePath = "PhamiBot/pics/placeholderMemes/";

var pics = [
    { files: [filePath + "cloudvjula.png"] },
    { files: [filePath + "gameExpoPhamiAndPatrick.png"] },
    { files: [filePath + "gameExpoPhamiAndPatrick2.png"] },
    { files: [filePath + "lauesimba.jpg"] },
    { files: [filePath + "lauexcaseoh.jpg"] },
    { files: [filePath + "maltheNoSmokers.png"] },
    { files: [filePath + "phamiAndJacobWingmanRank.png"] },
    { files: [filePath + "phamiHobby.jpg"] },
    { files: [filePath + "phamiJoke.png"] },
    { files: [filePath + "phamiLoseStreak.jpg"] },
    { files: [filePath + "phamiOnRobloxServers.png"] },
    { files: [filePath + "phamiStocks.png"] },
    { files: [filePath + "phamiWIFI.jpg"] },
    { files: [filePath + "phamiWIFI2.jpg"] },
    { files: [filePath + "ripRapRup.png"] },
    { files: [filePath + "ripRapRup2.png"] },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("placeholdermeme")
        .setDescription("Sender et tilfældigt placeholder meme."),

    async execute(interaction) {
        await interaction.reply(pics[Math.floor(Math.random() * pics.length)]);
    },
};
