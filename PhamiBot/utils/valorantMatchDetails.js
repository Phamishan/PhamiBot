const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    MessageFlags,
} = require("discord.js");

const { getValorantMatch } = require("../controllers/valorantMatch.js");

const BUTTON_PREFIX = "valmatch";

const RESULT_COLORS = {
    WON: 0x36c17a,
    LOST: 0xd23b3b,
    DRAW: 0x8a8f98,
};

function buildMatchButtons(games, puuid, size = 5) {
    const buttons = [...(games || [])]
        .sort((a, b) => b.date_raw - a.date_raw)
        .slice(0, size)
        .filter((game) => game.match_id)
        .map((game) => {
            const change = game.mmr_change_to_last_game;
            let style = ButtonStyle.Secondary;
            if (change > 0) style = ButtonStyle.Success;
            else if (change < 0) style = ButtonStyle.Danger;

            return new ButtonBuilder()
                .setCustomId(`${BUTTON_PREFIX}:${game.match_id}:${puuid}`)
                .setLabel(
                    `${game.map?.name ?? "Match"} ${change >= 0 ? "+" : ""}${change}`,
                )
                .setStyle(style);
        });

    return buttons.length
        ? [new ActionRowBuilder().addComponents(buttons)]
        : [];
}

function getResult(team) {
    if (!team) return "DRAW";
    if (team.roundsWon === team.roundsLost) return "DRAW";
    return team.won ? "WON" : "LOST";
}

function buildTeamText(players, puuid) {
    return players
        .map((p) => {
            const name = p.puuid === puuid ? `**${p.name}**` : p.name;
            return `${p.agent ?? "?"} • ${name} • ${p.kills}/${p.deaths}/${p.assists} • ${p.acs ?? "?"} ACS`;
        })
        .join("\n");
}

function buildMatchEmbed(match, puuid) {
    const me = match.players.find((p) => p.puuid === puuid);
    const myTeam = match.teams.find((t) => t.id === me?.team) ?? match.teams[0];
    const enemyTeam = match.teams.find((t) => t !== myTeam);
    const result = getResult(myTeam);

    const details = [
        match.mode,
        match.durationMs ? `${Math.round(match.durationMs / 60000)} min` : null,
        match.startedAt ? `<t:${Math.floor(match.startedAt / 1000)}:f>` : null,
    ].filter(Boolean);

    const embed = new EmbedBuilder()
        .setTitle(
            `:crossed_swords: ${match.map ?? "Match"} • ${myTeam?.roundsWon ?? 0}-${myTeam?.roundsLost ?? 0} ${result} :crossed_swords:`,
        )
        .setColor(RESULT_COLORS[result])
        .setTimestamp()
        .setFooter({
            text: "Created by @phamishan",
            iconURL:
                "https://raw.githubusercontent.com/Phamishan/PhamiBot/development/PhamiBot/pics/phamibot-avatar.png",
        });

    if (details.length) embed.setDescription(details.join(" • "));

    if (me) {
        embed.addFields({
            name: `${me.name}'s stats`,
            value: [
                `**${me.agent ?? "?"}** • ${me.rank ?? "Unrated"}`,
                `K/D/A ${me.kills}/${me.deaths}/${me.assists} • ACS ${me.acs ?? "?"} • ADR ${me.adr ?? "?"} • HS ${me.headshotPct ?? "?"}%`,
            ].join("\n"),
            inline: false,
        });
        if (me.agentIcon) embed.setThumbnail(me.agentIcon);
    }

    for (const [label, team] of [
        ["Your Team", myTeam],
        ["Enemy Team", enemyTeam],
    ]) {
        if (!team) continue;
        embed.addFields({
            name: `${me ? label : `Team ${team.id}`} • ${getResult(team)} ${team.roundsWon ?? 0}`,
            value: buildTeamText(
                match.players.filter((p) => p.team === team.id),
                puuid,
            ),
            inline: false,
        });
    }

    if (match.mapImage) embed.setImage(match.mapImage);

    return embed;
}

async function handleMatchButton(interaction) {
    const [, matchId, puuid] = interaction.customId.split(":");

    const ownerId = interaction.message.interactionMetadata?.user?.id;
    if (ownerId && ownerId !== interaction.user.id) {
        return interaction.reply({
            content: `Only <@${ownerId}> can open these matches. Use the command yourself to see them.`,
            flags: MessageFlags.Ephemeral,
        });
    }

    await interaction.deferReply();

    const match = await getValorantMatch(matchId);
    if (match.Error) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("Error")
            .setColor(0xff0000)
            .setDescription(
                "The details for this match aren't available. HenrikDev doesn't have every match.",
            );
        return interaction.editReply({ embeds: [errorEmbed] });
    }

    await interaction.editReply({ embeds: [buildMatchEmbed(match, puuid)] });
}

module.exports = {
    BUTTON_PREFIX,
    buildMatchButtons,
    buildMatchEmbed,
    handleMatchButton,
};
