const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("commands")
        .setDescription("Overblik over alle commands"),

    async execute(interaction) {
        try {
            await interaction.deferReply();
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
                        value: `Sends a random placeholder meme.`,
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
                        name: ":family_man_boy_boy: - ```/valrankfriends```",
                        value: `Finds Valorant profile (ONLY OG PLACEHOLDER & IN ORTUM)`,
                    },
                    {
                        name: ":index_pointing_at_the_viewer::skin-tone-4:  - ```/me```",
                        value: `Finds YOUR Valorant profile (ONLY OG PLACEHOLDER & IN ORTUM)`,
                    },
                    {
                        name: ":family_mmbb: - ```/premierteam```",
                        value: `Finds Premier teams, eg. In Ortum#IO`,
                    },
                    {
                        name: ":moneybag: - ```/bundles```",
                        value: `Finds current Valorant bundle(s)`,
                    },
                    {
                        name: ":heavy_plus_sign: - ```/addserver```",
                        value: `Add a Minecraft server to the list`,
                    },
                    {
                        name: ":eyes: - ```/checkserver```",
                        value: `Overview of all Minecraft servers`,
                    },
                    {
                        name: ":heavy_minus_sign: - ```/deleteserver```",
                        value: `Remove a saved Minecraft server (PH4M1 ONLY :P)`,
                    }
                )
                .setTimestamp()
                .setFooter({
                    text: "Created by @phamishan",
                    iconURL: "https://i.imgur.com/sNTzfld.jpg",
                });
            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error("Error handling /commands interaction:", err);
            try {
                await interaction.followUp({
                    content: "An error occurred while processing your request.",
                });
            } catch (followErr) {
                console.error("Failed to follow up on interaction:", followErr);
            }
        }
    },
};
