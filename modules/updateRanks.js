const User = require('../models/User');
const { guildId } = require('../config.json');
const { fetchRanks, processRanks } = require('../modules/functions');

module.exports = (client) => {
    const guild = client.guilds.cache.get(guildId)
    setInterval(async () => {
        const members = await guild.members.fetch();
        members.forEach(async (member) => {
            if (member.user.bot) return;
            let user = await User.findOne({ id: member.user.id });
            if (!user) user = await User.create({ id: member.user.id });
            if (!user.rlAcc || user.rlAcc == '') return

            if (client.rankRoles) {
                let data = await fetchRanks('epic', user.rlAcc);
                let processed = processRanks(data);

                let dividerRoles = client.rankRoles.find(obj => obj.name === 'Dividers');
                for (const role of dividerRoles.roles) {
                    if (!member.roles.cache.has(role)) member.roles.add(role);
                }

                for (const rank of processed) {
                    const rankingRoles = client.rankRoles.find(obj => obj.name === rank.name);
                    if (!rankingRoles) continue;

                    for (const role of rankingRoles.roles) {
                        const guildRole = await member.guild.roles.cache.get(role);
                        if (guildRole.name === rank.rank) {
                            member.roles.add(role);
                        }
                        else
                        {
                            member.roles.cache.has(role) ? member.roles.remove(role) : null;
                        }
                    }
                }
            }
        });
    }, 5 * 1000 * 60);
}