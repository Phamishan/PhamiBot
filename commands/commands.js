const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("commands")
    .setDescription("Overblik over alle commands"),

  async execute(interaction) {
    const guild = interaction.guild;
    const name = guild.name;

    const embed = new EmbedBuilder()
      .setTitle("Commands")
      .setDescription(`${name}'s commands`)
      .setColor(0xff0000)
      .addFields(
        {
          name: ":robot: - ```/commands```",
          value: `Overblik over alle commands.`,
        },
        { name: ":ping_pong: - ```/ping```", value: `Sender pong tilbage.` },
        {
          name: ":crown: - ```/patrick```",
          value: `Hvad mon det her er?? :eyes::eyes::eyes:`,
        },
        {
          name: ":rofl: - ```/placeholdermeme```",
          value: `Sender et tilfældigt placeholder meme.`,
        },
        { name: ":scroll: - ```/server```", value: `Server info.` },
        { name: ":gun: - ```/valrank```", value: `Valorant info.` }
      )
      .setFooter({
        text: "Created by @ph4m1",
        iconURL: "https://i.imgur.com/pcy4SD7.png",
      });
    await interaction.reply({ embeds: [embed] });
  },
};
