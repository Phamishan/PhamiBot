const { ActivityType } = require("discord.js");

module.exports = {
    name: "ready",
    once: true,
    execute(client) {
        client.user.setPresence({
            activities: [
                {
                    name: "Valorant",
                    type: ActivityType.Playing,
                },
            ],
            status: "online",
        });
        console.log(`Ready! Logged in as ${client.user.tag}.`);
    },
};
