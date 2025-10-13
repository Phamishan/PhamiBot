const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
} = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const OWNER_ID = "336187495978893312";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deleteserver")
        .setDescription("Remove a saved Minecraft server (PH4M1 ONLY :P)"),

    async execute(interaction) {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({
                content: "You do not have permission to use this command.",
            });
        }

        const guild = interaction.guild;
        const dataPath = path.join(__dirname, "..", "data", "servers.json");
        let all = {};
        try {
            const raw = fs.readFileSync(dataPath, "utf8");
            all = JSON.parse(raw || "{}");
        } catch (err) {}

        const guildServers = all[guild.id] || [];
        if (guildServers.length === 0) {
            return interaction.reply({
                content: "There are no saved servers to delete.",
            });
        }

        const options = guildServers.map((s, i) => ({
            label: s.name,
            description: s.ip,
            value: String(i),
        }));

        const menu = new StringSelectMenuBuilder()
            .setCustomId("delete_select_server")
            .setPlaceholder("Select a server to delete...")
            .addOptions(options.slice(0, 25));
        const row = new ActionRowBuilder().addComponents(menu);

        const embed = new EmbedBuilder()
            .setTitle("Delete saved server")
            .setDescription("Choose which server to delete.")
            .setColor(0xff0000)
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            components: [row],
        });
    },

    async handleSelect(interaction) {
        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== "delete_select_server") return;
        if (interaction.user.id !== OWNER_ID) {
            return interaction.update({
                content: "You do not have permission to delete servers.",
                components: [],
                embeds: [],
            });
        }

        const guild = interaction.guild;
        const dataPath = path.join(__dirname, "..", "data", "servers.json");
        let all = {};
        try {
            const raw = fs.readFileSync(dataPath, "utf8");
            all = JSON.parse(raw || "{}");
        } catch (err) {}

        const guildServers = all[guild.id] || [];
        const idx = Number(interaction.values[0]);
        const server = guildServers[idx];
        if (!server)
            return interaction.update({
                content: "Server not found.",
                components: [],
                embeds: [],
            });

        guildServers.splice(idx, 1);
        all[guild.id] = guildServers;
        try {
            fs.writeFileSync(dataPath, JSON.stringify(all, null, 2), "utf8");
        } catch (err) {
            console.error("Failed to delete server:", err);
            return interaction.update({
                content: "Could not delete the server.",
                components: [],
                embeds: [],
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("Server deleted")
            .setDescription(
                `Server **${server.name}** (${server.ip}) has been deleted.`
            )
            .setColor(0x00ff00)
            .setTimestamp();

        return interaction.update({
            embeds: [embed],
            components: [],
        });
    },
};
