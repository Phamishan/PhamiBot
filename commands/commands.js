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
                {
                    name: ":ping_pong: - ```/ping```",
                    value: `Sender pong tilbage.`,
                },
                {
                    name: ":crown: - ```/patrick```",
                    value: `Hvad mon det her er?? :eyes::eyes::eyes:`,
                },
                {
                    name: ":rofl: - ```/placeholdermeme```",
                    value: `Sender et tilfældigt placeholder meme.`,
                },
                {
                    name: ":scroll: - ```/server```",
                    value: `Server info.`,
                },
                {
                    name: ":gun: - ```/valrank```",
                    value: `Finds valorant profile, eg. ph4m1#yin (RANK NEEDED)`,
                },
                {
                    name: ":family_mmbb: - ```/premierteam```",
                    value: `Finds Premier teams, eg. placeholder#plh`,
                },
                {
                    name: ":index_pointing_at_the_viewer::skin-tone-4:  - ```/me```",
                    value: `Finds YOUR valorant profile (ONLY OG PLACEHOLDER) (RANK NEEDED)`,
                },
                {
                    name: ":moneybag: - ```/bundles```",
                    value: `Finds current valorant bundle(s)`,
                }
            )
            .setTimestamp()
            .setFooter({
                text: "Created by @phamishan",
                iconURL: "https://i.imgur.com/pcy4SD7.png",
            });
        await interaction.reply({ embeds: [embed] });
    },
};
