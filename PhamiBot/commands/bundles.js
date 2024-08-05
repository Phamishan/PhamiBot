const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");

const getBundles = require("../controllers/searchForBundles.js");
const getBundleImage = require("../controllers/searchForBundleImage.js");

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("bundles")
        .setDescription("Finds current Valorant bundle(s)"),

    async execute(interaction) {
        await interaction.deferReply();

        const bundles = await getBundles();
        const bundleImage = await getBundleImage();

        const bundleUUID = bundles.data[0].bundle_uuid;

        for (let i = 0; i < bundleImage.data.length; i++) {
            if (bundleImage.data[i].uuid === bundleUUID) {
                // Creating the embed
                const fullBundle = new EmbedBuilder()
                    .setTitle(
                        `:nerd: ${bundleImage.data[i].displayName} :nerd:`
                    )
                    .setColor(0xff0000)
                    .setImage(`${bundleImage.data[i].displayIcon}`)
                    .setTimestamp()
                    .setFooter({
                        text: "Created by @phamishan",
                        iconURL: "https://i.imgur.com/sNTzfld.jpg",
                    });

                const itemsInBundle = [];

                for (let i = 0; i < bundles.data[0].items.length; i++) {
                    const item = new EmbedBuilder()
                        .setTitle(
                            `:moneybag: ${bundles.data[0].items[i].name} | ${bundles.data[0].items[i].base_price} VP :moneybag:`
                        )
                        .setColor(0xff0000)
                        .setImage(`${bundles.data[0].items[i].image}`)
                        .setTimestamp()
                        .setFooter({
                            text: "Created by @phamishan",
                            iconURL: "https://i.imgur.com/sNTzfld.jpg",
                        });

                    itemsInBundle.push(item);
                }

                const viewFullBundle = new ButtonBuilder()
                    .setCustomId("viewFullBundle")
                    .setLabel("View full bundle")
                    .setStyle(ButtonStyle.Primary);

                const row = new ActionRowBuilder().addComponents(
                    viewFullBundle
                );

                // Replying with the embed
                const response = await interaction.editReply({
                    embeds: [fullBundle],
                    components: [row],
                });

                const collectorFilter = (i) =>
                    i.user.id === interaction.user.id;
                try {
                    const confirmation = await response.awaitMessageComponent({
                        filter: collectorFilter,
                        time: 60_000,
                    });

                    if (confirmation.customId === "viewFullBundle") {
                        await confirmation.update({
                            embeds: itemsInBundle,
                            components: [],
                        });
                    }
                } catch (e) {
                    await interaction.editReply({
                        content:
                            "Confirmation not received within 1 minute, cancelling",
                        components: [],
                    });
                }
            }
        }
    },
};
