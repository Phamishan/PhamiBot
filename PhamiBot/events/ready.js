const { ActivityType } = require("discord.js");

module.exports = {
    name: "clientReady",
    once: true,
    execute(client) {
        client.user.setPresence({
            activities: [
                {
                    name: "PlaceHoldia",
                    type: ActivityType.Watching,
                },
            ],
            status: "online",
        });
        console.log(`Client ready! Logged in as ${client.user.tag}.`);
    },
};
