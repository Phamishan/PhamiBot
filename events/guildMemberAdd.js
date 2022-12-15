module.exports = {
    name: 'guildMemberAdd',
    once: false,
    execute(member) {
        const channel = member.guild.channels.cache.get('1052904915846058024');
        channel.send(`${member.user} has joined the server!`);
    }
}