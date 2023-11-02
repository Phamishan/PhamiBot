const { SlashCommandBuilder } = require("discord.js");

const filePath = "PhamiBot/pics/placeholderMemes/";

var pics = [
    { files: [filePath + "phamiJoke.png"] },
    { files: [filePath + "phamiStocks.png"] },
    { files: [filePath + "ripRapRup.png"] },
    { files: [filePath + "ripRapRup2.png"] },
    { files: [filePath + "gameExpoPhamiAndPatrick.png"] },
    { files: [filePath + "gameExpoPhamiAndPatrick2.png"] },
    { files: [filePath + "phamiAndJacobWingmanRank.png"] },
    { files: [filePath + "phamiOnRobloxServers.jpg"] },
    { files: [filePath + "phamiHobby.jpg"] },
    { files: [filePath + "phamiLoseStreak.jpg"] },
    { files: [filePath + "phamiWIFI.jpg"] },
    { files: [filePath + "phamiWIFI2.jpg"] },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("placeholdermeme")
        .setDescription("Sender et tilfældigt placeholder meme."),

    async execute(interaction) {
        await interaction.reply(pics[Math.floor(Math.random() * pics.length)]);
    },
};
