module.exports = {
    name: "interactionCreate",
    once: false,
    async execute(interaction) {
        if (interaction.isStringSelectMenu()) {
            const id = interaction.customId;
            try {
                if (id === "select_server") {
                    const cmd = interaction.client.commands.get("checkserver");
                    if (cmd && typeof cmd.handleSelect === "function")
                        return await cmd.handleSelect(interaction);
                } else if (id === "delete_select_server") {
                    const cmd = interaction.client.commands.get("deleteserver");
                    if (cmd && typeof cmd.handleSelect === "function")
                        return await cmd.handleSelect(interaction);
                }
            } catch (err) {
                console.error(err);
                if (!interaction.replied && !interaction.deferred) {
                    return interaction.reply({
                        content:
                            "An error occurred while handling the selection.",
                    });
                }
                return interaction.followUp({
                    content: "An error occurred while handling the selection.",
                });
            }
        }

        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(
            interaction.commandName
        );

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(err);
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content:
                            "There was an error while executing this command!",
                    });
                } else {
                    try {
                        await interaction.followUp({
                            content:
                                "There was an error while executing this command!",
                        });
                    } catch (followErr) {
                        console.warn(
                            "Could not followUp on interaction after error:",
                            followErr.message || followErr
                        );
                    }
                }
            } catch (replyErr) {
                console.warn(
                    "Could not send error reply for interaction:",
                    replyErr.message || replyErr
                );
            }
        }
    },
};
