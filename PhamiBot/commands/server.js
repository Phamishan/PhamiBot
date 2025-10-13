const {
    SlashCommandBuilder,
    EmbedBuilder,
    ChannelType,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("server")
        .setDescription("Server info."),

    async execute(interaction) {
        try {
            await interaction.deferReply();
            const guild = interaction.guild;
            const name = guild.name;
            const creationDate = Math.floor(guild.createdTimestamp / 1000);
            const owner = await guild.fetchOwner();
            const members = await guild.memberCount;
            const textChannels = guild.channels.cache.filter(
                (c) => c.type === ChannelType.GuildText
            ).size;
            const voiceChannels = guild.channels.cache.filter(
                (c) => c.type === ChannelType.GuildVoice
            ).size;
            const roles = guild.roles.cache.size;

            const embed = new EmbedBuilder()
                .setTitle("Server Info")
                .setDescription(`${name}'s server information`)
                .setColor(0xff0000)
                .addFields(
                    {
                        name: ":calendar: Created on:",
                        value: `<t:${creationDate}>`,
                        inline: true,
                    },
                    {
                        name: ":crown: Owned by:",
                        value: `${owner}`,
                        inline: true,
                    },
                    {
                        name: ":busts_in_silhouette: Number of members:",
                        value: `${members}`,
                        inline: true,
                    },
                    {
                        name: ":speech_balloon: Text channels:",
                        value: `${textChannels}`,
                        inline: true,
                    },
                    {
                        name: ":microphone2: Voice channels:",
                        value: `${voiceChannels}`,
                        inline: true,
                    },
                    {
                        name: ":label: Number of roles:",
                        value: `${roles}`,
                        inline: true,
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
