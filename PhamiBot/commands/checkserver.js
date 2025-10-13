const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
} = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const { request } = require("undici");
const {
    getUuidForName,
    getCrafatarUrlFromUuid,
} = require("../utils/minecraft");
const { AttachmentBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("checkserver")
        .setDescription("Overview of all Minecraft servers"),

    async execute(interaction) {
        const guild = interaction.guild;
        const dataPath = path.join(__dirname, "..", "data", "servers.json");
        let all = {};
        try {
            const raw = fs.readFileSync(dataPath, "utf8");
            all = JSON.parse(raw || "{}");
        } catch (err) {
            // no data
        }

        const guildServers = all[guild.id] || [];

        if (guildServers.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle("No servers")
                .setDescription(
                    `There are no saved servers. Add one with /addserver`
                )
                .setColor(0xff0000)
                .setTimestamp()
                .setFooter({
                    text: "Created by @phamishan",
                    iconURL: "https://i.imgur.com/sNTzfld.jpg",
                });
            return interaction.reply({ embeds: [embed] });
        }

        const options = guildServers.map((s, i) => ({
            label: s.name,
            description: s.ip,
            value: String(i),
        }));

        const menu = new StringSelectMenuBuilder()
            .setCustomId("select_server")
            .setPlaceholder("Select a server...")
            .addOptions(options.slice(0, 25));

        const row = new ActionRowBuilder().addComponents(menu);

        const embed = new EmbedBuilder()
            .setTitle("Select a server")
            .setDescription("Choose a server to see who is online")
            .setColor(0xff0000)
            .setTimestamp()
            .setFooter({
                text: "Created by @phamishan",
                iconURL: "https://i.imgur.com/sNTzfld.jpg",
            });

        await interaction.reply({
            embeds: [embed],
            components: [row],
        });
    },

    async handleSelect(interaction) {
        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== "select_server") return;

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

        const api = `https://api.mcsrvstat.us/2/${encodeURIComponent(
            server.ip
        )}`;
        let json = null;
        try {
            const res = await request(api, {
                method: "GET",
                headers: {
                    "User-Agent":
                        "PhamiBot/1.0 (+https://github.com/Phamishan/PhamiBot)",
                    Accept: "application/json",
                },
            });
            const status = res.statusCode || res.status;
            const text = await res.body.text();
            try {
                json = JSON.parse(text);
            } catch (parseErr) {
                console.error(
                    "Failed to parse JSON from mcsrvstat response:",
                    parseErr
                );
                const snippet = text && text.slice ? text.slice(0, 200) : text;
                const lower = (snippet || "").toLowerCase();
                if (
                    lower.includes("<html") ||
                    lower.includes("<!doctype html>")
                ) {
                    return interaction.update({
                        content: `Received HTML instead of JSON from the status API (status ${status}). The API may be down or returning an HTML error page. Try again later.`,
                        components: [],
                        embeds: [],
                    });
                }
                if (
                    lower.includes("rate limit") ||
                    lower.includes("too many requests")
                ) {
                    return interaction.update({
                        content: `Status API svarer med rate-limit (status ${status}). Prøv igen om lidt.`,
                        components: [],
                        embeds: [],
                    });
                }
                if (
                    lower.startsWith("your request") ||
                    lower.includes("your request has been")
                ) {
                    return interaction.update({
                        content: `Status API rejected the request (possibly blocked). Try again later or check the server IP.`,
                        components: [],
                        embeds: [],
                    });
                }
                console.error("Response snippet:", snippet);
                return interaction.update({
                    content: `Could not parse server status (non-JSON response, status ${status}).`,
                    components: [],
                    embeds: [],
                });
            }
        } catch (err) {
            console.error("Failed to fetch server status:", err);
            return interaction.update({
                content: "Could not fetch server status.",
                components: [],
                embeds: [],
            });
        }

        if (!json || !json.online) {
            return interaction.update({
                content: `Server **${server.name}** (${server.ip}) is offline or cannot be reached.`,
                components: [],
                embeds: [],
            });
        }

        const players =
            json.players && json.players.list ? json.players.list : [];

        const attachments = [];
        if (players.length === 0) {
            return interaction.update({
                content: `No players online on **${server.name}** (${server.ip}).`,
                components: [],
                embeds: [],
            });
        }

        const fields = players.slice(0, 25).map((p) => ({
            name: p,
            value: `[Avatar](https://crafatar.com/avatars/${encodeURIComponent(
                p
            )}?size=32&overlay=true)`,
            inline: true,
        }));

        const mainEmbed = new EmbedBuilder()
            .setTitle(`Players online on ${server.name}:`)
            .setDescription(server.ip)
            .setColor(0x00ff00)
            .setTimestamp();

        const sample = players.slice(0, 9);
        const uuidPromises = sample.map((name) =>
            getUuidForName(name).catch(() => null)
        );
        const resolved = await Promise.all(uuidPromises);

        const playerEmbeds = [];
        for (let i = 0; i < sample.length; i++) {
            const p = sample[i];
            const uuid = resolved[i];
            const avatarUrl = uuid
                ? getCrafatarUrlFromUuid(uuid, 64)
                : `https://crafatar.com/avatars/${encodeURIComponent(
                      p
                  )}?size=64&overlay=true`;

            let appended = false;
            try {
                const r = await request(avatarUrl, {
                    method: "GET",
                    headers: {
                        "User-Agent": "PhamiBot/1.0",
                        Accept: "image/*",
                    },
                });
                const status = r.statusCode || r.status;
                if (status === 200) {
                    const arrayBuffer = await r.body.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const fname = `avatar_${i}.png`;
                    attachments.push(
                        new AttachmentBuilder(buffer, { name: fname })
                    );
                    playerEmbeds.push(
                        new EmbedBuilder()
                            .setTitle(p)
                            .setThumbnail(`attachment://${fname}`)
                            .setColor(0x0099ff)
                    );
                    appended = true;
                }
            } catch (err) {
                console.error("Failed to fetch avatar image:", err);
            }

            if (!appended) {
                playerEmbeds.push(
                    new EmbedBuilder()
                        .setTitle(p)
                        .setThumbnail(avatarUrl)
                        .setColor(0x0099ff)
                );
            }
        }

        const allEmbeds = [mainEmbed, ...playerEmbeds];
        try {
            await interaction.deferReply();
            await interaction.editReply({
                embeds: allEmbeds,
                files: attachments,
            });
            return;
        } catch (err) {
            console.error(
                "Failed to send editReply with attachments, falling back to update without files:",
                err
            );
            return interaction.update({ embeds: allEmbeds, components: [] });
        }
    },
};
