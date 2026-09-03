const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const { BRAND_COLORS } = require("../utils/embedStyle.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addserver")
        .setDescription("Add a Minecraft server to the list")
        .addStringOption((option) =>
            option
                .setName("serverip")
                .setDescription("The IP address of the Minecraft server")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("servername")
                .setDescription("The name of the Minecraft server")
                .setRequired(true)
        ),

    async execute(interaction) {
        const guild = interaction.guild;
        const serverIp = interaction.options.getString("serverip");
        const serverName = interaction.options.getString("servername");

        const dataPath = path.join(__dirname, "..", "data", "servers.json");
        let all = {};
        try {
            const raw = fs.readFileSync(dataPath, "utf8");
            all = JSON.parse(raw || "{}");
        } catch (err) {
            console.error("Failed to read servers file:", err);
        }

        if (!all[guild.id]) all[guild.id] = [];
        all[guild.id].push({ name: serverName, ip: serverIp });

        try {
            fs.mkdirSync(path.dirname(dataPath), { recursive: true });
            fs.writeFileSync(dataPath, JSON.stringify(all, null, 2), "utf8");
        } catch (err) {
            console.error("Failed to save server:", err);
            return interaction.reply({ content: "Could not save the server." });
        }

        const embed = new EmbedBuilder()
            .setTitle("⛏️ Server added")
            .setDescription(
                `Server **${serverName}** with IP **${serverIp}** has been added.`
            )
            .setColor(BRAND_COLORS.minecraft)
            .setTimestamp()
            .setFooter({
                text: "Created by @phamishan",
                iconURL: "https://i.imgur.com/sNTzfld.jpg",
            });

        await interaction.reply({ embeds: [embed] });
    },
};
