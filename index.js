require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const { registerEvents, registerCommands } = require('./utils');

registerEvents(client);
registerCommands(client);

client.login(process.env.TOKEN);