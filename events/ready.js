const { ActivityType } = require("discord.js");

module.exports = {
    name: "ready",
    once: true,
    execute(client) {
        client.user.setPresence({
            activities: [
                {
                    name: "with your mom",
                    type: ActivityType.Streaming,
                    url: "https://twitch.tv/pokimane",
                },
            ],
            status: "online",
        });
        console.log(`Ready! Logged in as ${client.user.tag}.`);
    },
};
