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
                    name: ":rofl: - ```/placeholdermeme```",
                    value: `Sender et tilfældigt placeholder meme.`,
                },
                {
                    name: ":scroll: - ```/server```",
                    value: `Server info.`,
                },
                {
                    name: ":gun: - ```/valrank```",
                    value: `Finds Valorant profile, eg. PH4M1#YIN`,
                },
                {
                    name: ":family_mmbb: - ```/premierteam```",
                    value: `Finds Premier teams, eg. In Ortum#IO`,
                },
                {
                    name: ":index_pointing_at_the_viewer::skin-tone-4:  - ```/me```",
                    value: `Finds YOUR Valorant profile (ONLY OG PLACEHOLDER & IN ORTUM)`,
                },
                {
                    name: ":moneybag: - ```/bundles```",
                    value: `Finds current Valorant bundle(s)`,
                }
            )
            .setTimestamp()
            .setFooter({
                text: "Created by @phamishan",
                iconURL: "https://i.imgur.com/sNTzfld.jpg",
            });
        await interaction.reply({ embeds: [embed] });
    },
};
