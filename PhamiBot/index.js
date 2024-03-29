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
        iconURL: "https://i.imgur.com/sNTzfld.jpg",
    });

client.on("guildCreate", (guild) => {
    guild.systemChannel.send({ embeds: [welcomeMessage] });
});

client.login(process.env.TOKEN);
