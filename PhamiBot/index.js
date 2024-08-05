require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
const { registerEvents, registerCommands } = require("./utils");
var deployCommandsFunc = require("./deploy-commands");

deployCommandsFunc.deployCommandsFunc();
registerEvents(client);
registerCommands(client);

const welcomeMessage = new EmbedBuilder()
    .setTitle("Hejsa!")
    .setDescription("Server commands:")
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

client.on("guildCreate", (guild) => {
    guild.systemChannel.send({ embeds: [welcomeMessage] });
});

client.login(process.env.TOKEN);
