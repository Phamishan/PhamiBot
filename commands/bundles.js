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
        .setDescription("Finds current valorant bundle(s)"),

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
                        iconURL: "https://i.imgur.com/pcy4SD7.png",
                    });

                // Creating the embed
                const item0 = new EmbedBuilder()
                    .setTitle(
                        `:moneybag: ${bundles.data[0].items[0].name} | ${bundles.data[0].items[0].base_price} VP :moneybag:`
                    )
                    .setColor(0xff0000)
                    .setImage(`${bundles.data[0].items[0].image}`)
                    .setTimestamp()
                    .setFooter({
                        text: "Created by @phamishan",
                        iconURL: "https://i.imgur.com/pcy4SD7.png",
                    });

                // Creating the embed
                const item1 = new EmbedBuilder()
                    .setTitle(
                        `:moneybag: ${bundles.data[0].items[1].name} | ${bundles.data[0].items[1].base_price} VP :moneybag:`
                    )
                    .setColor(0xff0000)
                    .setImage(`${bundles.data[0].items[1].image}`)
                    .setTimestamp()
                    .setFooter({
                        text: "Created by @phamishan",
                        iconURL: "https://i.imgur.com/pcy4SD7.png",
                    });

                // Creating the embed
                const item2 = new EmbedBuilder()
                    .setTitle(
                        `:moneybag: ${bundles.data[0].items[2].name} | ${bundles.data[0].items[2].base_price} VP :moneybag:`
                    )
                    .setColor(0xff0000)
                    .setImage(`${bundles.data[0].items[2].image}`)
                    .setTimestamp()
                    .setFooter({
                        text: "Created by @phamishan",
                        iconURL: "https://i.imgur.com/pcy4SD7.png",
                    });

                // Creating the embed
                const item3 = new EmbedBuilder()
                    .setTitle(
                        `:moneybag: ${bundles.data[0].items[3].name} | ${bundles.data[0].items[3].base_price} VP :moneybag:`
                    )
                    .setColor(0xff0000)
                    .setImage(`${bundles.data[0].items[3].image}`)
                    .setTimestamp()
                    .setFooter({
                        text: "Created by @phamishan",
                        iconURL: "https://i.imgur.com/pcy4SD7.png",
                    });

                // Creating the embed
                const item4 = new EmbedBuilder()
                    .setTitle(
                        `:moneybag: ${bundles.data[0].items[4].name} | ${bundles.data[0].items[4].base_price} VP :moneybag:`
                    )
                    .setColor(0xff0000)
                    .setImage(`${bundles.data[0].items[4].image}`)
                    .setTimestamp()
                    .setFooter({
                        text: "Created by @phamishan",
                        iconURL: "https://i.imgur.com/pcy4SD7.png",
                    });

                /*
                    // Creating the embed
                const item5 = new EmbedBuilder()
                    .setTitle(
                        `:moneybag: ${bundles.data[0].items[5].name} | ${bundles.data[0].items[5].base_price} VP :moneybag:`
                    )
                    .setColor(0xff0000)
                    .setImage(`${bundles.data[0].items[5].image}`)
                    .setTimestamp()
                    .setFooter({
                        text: "Created by @phamishan",
                        iconURL: "https://i.imgur.com/pcy4SD7.png",
                    });

                // Creating the embed
                const item6 = new EmbedBuilder()
                    .setTitle(
                        `:moneybag: ${bundles.data[0].items[6].name} | ${bundles.data[0].items[6].base_price} VP :moneybag:`
                    )
                    .setColor(0xff0000)
                    .setImage(`${bundles.data[0].items[6].image}`)
                    .setTimestamp()
                    .setFooter({
                        text: "Created by @phamishan",
                        iconURL: "https://i.imgur.com/pcy4SD7.png",
                    });

                // Creating the embed
                const item7 = new EmbedBuilder()
                    .setTitle(
                        `:moneybag: ${bundles.data[0].items[7].name} | ${bundles.data[0].items[7].base_price} VP :moneybag:`
                    )
                    .setColor(0xff0000)
                    .setImage(`${bundles.data[0].items[7].image}`)
                    .setTimestamp()
                    .setFooter({
                        text: "Created by @phamishan",
                        iconURL: "https://i.imgur.com/pcy4SD7.png",
                    });
*/
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
                            embeds: [item0, item1, item2, item3, item4],
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
