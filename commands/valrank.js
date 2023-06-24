const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const getPlayerRank = require("../controllers/searchForPlayerRank.js");
const getPlayerInfo = require("../controllers/searchForPlayerInfo.js");

// Create the slash command.
module.exports = {
  data: new SlashCommandBuilder()
    .setName("valrank")
    .setDescription("Finds a players data")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("input to echo back")
        .setRequired(true)
    ),
  async execute(interaction) {
    // Wait for the users input and store that in const input
    const input = await interaction.options.get("input");

    // Pass the input to the methods which is created in the controllers folder.
    const playerRank = await getPlayerRank(input.value);
    const playerInfo = await getPlayerInfo(input.value);

    // Creating the embed
    const embed = new EmbedBuilder()
      .setTitle(`${playerInfo.data.name}` + "#" + `${playerInfo.data.tag}`)
      .setColor(0xff0000)
      .addFields({
        name: "Rank:",
        value: `${playerRank.data.currenttierpatched}`,
        inline: true,
      })
      .setThumbnail(`${playerInfo.data.card.small}`)
      .setImage(`${playerRank.data.images.small}`);

    // Replying with the embed
    interaction.reply({ embeds: [embed] });
  },
};
