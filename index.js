require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const { registerEvents, registerCommands } = require('./utils');

registerEvents(client);
registerCommands(client);

const test = new EmbedBuilder()
    .setTitle('Hejsa!')
    .setDescription('Server commands:')
    .setColor(0XFF0000)
    .addFields(
        { name: ':robot: - ```/commands```', value: `Overblik over alle commands.` },
        { name: ':ping_pong: - ```/ping```', value: `Sender Pong tilbage.` },
        { name: ':crown: - ```/patrick```', value: `Hvad mon det her er?? :eyes::eyes::eyes:` },
        { name: ':scroll: - ```/server```', value: `Server info.` },
    )

client.on('guildCreate', guild => {
    guild.systemChannel.send({ embeds: [test] })
});

client.login(process.env.TOKEN);