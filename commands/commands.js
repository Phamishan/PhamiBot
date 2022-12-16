const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commands')
        .setDescription('Overblik over alle commands'),

    async execute(interaction) {
        const guild = interaction.guild;
        const name = guild.name;

        const embed = new EmbedBuilder()
            .setTitle('Commands')
            .setDescription(`${name}'s commands`)
            .setColor(0XFF0000)
            .addFields(
                { name: ':robot: - ```/commands```', value: `Overblik over alle commands.` },
                { name: ':ping_pong: - ```/ping```', value: `Sender pong tilbage.` },
                { name: ':crown: - ```/patrick```', value: `Hvad mon det her er?? :eyes::eyes::eyes:` },
                { name: ':rofl: - ```/placeholdermeme```', value: `Sender et tilfældigt placeholder meme.` },
                { name: ':scroll: - ```/server```', value: `Server info.` },
            )
        await interaction.reply({ embeds: [embed] });
    },
};