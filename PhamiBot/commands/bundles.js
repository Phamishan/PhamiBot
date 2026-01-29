const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    InteractionContextType,
} = require("discord.js");

const getBundles = require("../controllers/bundles.js");
const getBundleImage = require("../controllers/bundleImage.js");

// Create the slash command.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("bundles")
        .setDescription("Finds current Valorant bundle(s)")
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const bundles = await getBundles();
        const bundleImage = await getBundleImage();

        // Create embeds for all bundles
        const bundleEmbeds = [];
        const bundleData = []; // Store bundle data for button handling

        for (
            let bundleIndex = 0;
            bundleIndex < bundles.data.length;
            bundleIndex++
        ) {
            const bundleUUID = bundles.data[bundleIndex].bundle_uuid;

            for (let i = 0; i < bundleImage.data.length; i++) {
                if (bundleImage.data[i].uuid === bundleUUID) {
                    // Creating the embed
                    const fullBundle = new EmbedBuilder()
                        .setTitle(
                            `:information_source: ${bundleImage.data[i].displayName} | ${bundles.data[bundleIndex].bundle_price} VP :information_source:`,
                        )
                        .setColor(0xff0000)
                        .setImage(`${bundleImage.data[i].displayIcon}`)
                        .setTimestamp()
                        .setFooter({
                            text: "Created by @phamishan",
                            iconURL: "https://i.imgur.com/sNTzfld.jpg",
                        });

                    bundleEmbeds.push(fullBundle);

                    // Store items for this bundle
                    const itemsInBundle = [];

                    for (
                        let j = 0;
                        j < bundles.data[bundleIndex].items.length;
                        j++
                    ) {
                        if (bundles.data[bundleIndex].items[j].image == null) {
                            continue;
                        }

                        const item = new EmbedBuilder()
                            .setTitle(
                                `:moneybag: ${bundles.data[bundleIndex].items[j].name} | ${bundles.data[bundleIndex].items[j].base_price} VP :moneybag:`,
                            )
                            .setColor(0xff0000)
                            .setImage(
                                `${bundles.data[bundleIndex].items[j].image}`,
                            )
                            .setTimestamp()
                            .setFooter({
                                text: "Created by @phamishan",
                                iconURL: "https://i.imgur.com/sNTzfld.jpg",
                            });

                        itemsInBundle.push(item);
                    }

                    // Add bundle price to items embeds
                    const priceEmbed = new EmbedBuilder()
                        .setTitle(
                            `:information_source: Bundle Price :information_source:`,
                        )
                        .setDescription(
                            `**${bundles.data[bundleIndex].bundle_price} VP**`,
                        )
                        .setColor(0xff0000)
                        .setTimestamp()
                        .setFooter({
                            text: "Created by @phamishan",
                            iconURL: "https://i.imgur.com/sNTzfld.jpg",
                        });

                    const itemsWithPrice = [priceEmbed, ...itemsInBundle];

                    bundleData.push({
                        bundleEmbed: fullBundle,
                        items: itemsWithPrice,
                    });

                    break;
                }
            }
        }

        // Create buttons for each bundle
        const buttons = [];
        for (let i = 0; i < bundleData.length; i++) {
            buttons.push(
                new ButtonBuilder()
                    .setCustomId(`viewBundle_${i}`)
                    .setLabel(`Bundle ${i + 1}`)
                    .setStyle(ButtonStyle.Primary),
            );
        }

        const row = new ActionRowBuilder().addComponents(buttons);

        // Replying with the embeds
        const response = await interaction.editReply({
            embeds: bundleEmbeds,
            components: [row],
        });

        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 60_000,
            });

            const customId = confirmation.customId;
            if (customId.startsWith("viewBundle_")) {
                const bundleIndex = parseInt(customId.split("_")[1]);
                await confirmation.update({
                    embeds: bundleData[bundleIndex].items,
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
    },
};
