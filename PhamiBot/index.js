const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
});
const { registerEvents, registerCommands } = require("./utils");
var deployCommandsFunc = require("./deploy-commands");

deployCommandsFunc.deployCommandsFunc();
registerEvents(client);
registerCommands(client);

const welcomeMessage = new EmbedBuilder()
    .setTitle("Hi!")
    .setDescription("Server commands:")
    .setColor(0xff0000)
    .addFields(
        {
            name: ":robot: - ```/commands```",
            value: "Overview of all commands.",
        },
        {
            name: ":rofl: - ```/placeholdermeme```",
            value: "Sends a random placeholder meme.",
        },
        {
            name: ":scroll: - ```/server```",
            value: "Server info.",
        },
        {
            name: ":gun: - ```/valrank```",
            value: "Finds VALORANT profile, e.g. PH4M1#IOM",
        },
        {
            name: ":family_man_boy_boy: - ```/valrankfriends```",
            value: "Finds VALORANT profile (ONLY OG PLACEHOLDER & IN ORTUM)",
        },
        {
            name: ":index_pointing_at_the_viewer::skin-tone-4:  - ```/me```",
            value: "Finds YOUR VALORANT profile (ONLY OG PLACEHOLDER & IN ORTUM)",
        },
        {
            name: ":family_mmbb: - ```/premierteam```",
            value: "Finds Premier teams, e.g. In Ortum#IO",
        },
        {
            name: ":moneybag: - ```/bundles```",
            value: "Finds current VALORANT bundle(s)",
        },
        {
            name: ":calendar: - ```/season```",
            value: "Shows the current VALORANT episode and act",
        },
        {
            name: ":bar_chart: - ```/valleaderboard```",
            value: "Ranks multiple VALORANT players from provided UUIDs",
        },
        {
            name: ":crossed_swords: - ```/matches```",
            value: "View last 10 competitive VALORANT matches",
        },           
        {
            name: ":heavy_plus_sign: - ```/addserver```",
            value: "Add a Minecraft server to the list",
        },
        {
            name: ":eyes: - ```/checkserver```",
            value: "Overview of all Minecraft servers",
        },
        {
            name: ":heavy_minus_sign: - ```/deleteserver```",
            value: "Remove a saved Minecraft server (PH4M1 ONLY :P)",
        },
        {
            name: ":parachute: - ```/apexrank```",
            value: "Finds Apex Legends profile, e.g. PH4M1 (ENTER EA ACCOUNT NAME)",
        },
        {
            name: ":family_man_boy_boy: - ```/apexrankfriends```",
            value: "Finds Apex Legends profile (ONLY PRIMEHOLDERS+)",
        },
        {
            name: ":map: - ```/maprotation```",
            value: "Finds the current and next map [RANKED] (Apex Legends)",
        },
    )
    .setTimestamp()
    .setFooter({
        text: "Created by @phamishan",
        iconURL: "https://i.imgur.com/sNTzfld.jpg",
    });

client.on("guildCreate", (guild) => {
    guild.systemChannel.send({ embeds: [welcomeMessage] });
});

client.login(process.env.TOKEN);
