const { ActivityType } = require("discord.js");

module.exports = {
    name: "clientReady",
    once: true,
    execute(client) {
        client.user.setPresence({
            activities: [
                {
                    type: ActivityType.Custom,
                    name: "custom",
                    state: "✨ /commands ✨",
                },
            ],
        });
        console.log(`Client ready! Logged in as ${client.user.tag}.`);
    },
};
