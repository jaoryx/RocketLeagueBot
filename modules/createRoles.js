const Roles = require('../models/Roles');
const { Colors } = require('discord.js');
const { guildId } = require('../config.json');

module.exports = async (client) => {
    const roles = await Roles.find();
    const guild = client.guilds.cache.get(guildId);

    /*guild.roles.fetch().then(roles => {
        roles.forEach(async role => {
            try {
                await role.delete();
            } catch (error) {
                
            }
        });;
    }).catch(console.error);*/

    if (roles.length == 0) {
        const playlists = ['Ranked Duel 1v1', 'Ranked Doubles 2v2', 'Ranked Standard 3v3', 'Tournament Matches'];

        let colors = {
            "Unranked": Colors.Default,
            "Bronze": Colors.Orange,
            "Silver": Colors.LightGrey,
            "Gold": Colors.Gold,
            "Platinum": Colors.Aqua,
            "Diamond": Colors.Blue,
            "Champion": Colors.Purple,
            "Grand Champion": Colors.Red,
            "Supersonic Legend": Colors.White
        }

        let ranks = Object.keys(colors);

        let dividers = [];

        for (const playlist of playlists) {
            const roleMade = await guild.roles.create({
                name: 'ㅤㅤㅤ' + playlist + 'ㅤㅤㅤ',
                color: Colors.Default
            });
            dividers.push(roleMade.id)
            
            let rankroles = [];

            for (const rank of ranks) {
                if (rank == "Unranked" || rank == "Supersonic Legend") {
                    const rankMade = await guild.roles.create({
                        name: rank,
                        color: colors[rank]
                    });
                    rankroles.push(rankMade.id);;
                } else {
                    let I = "I";
                    for (let i = 1; I.length < 4; i++) {
                        const rankMade = await guild.roles.create({
                            name: rank + " " + I,
                            color: colors[rank]
                        });
                        I += "I";
                        rankroles.push(rankMade.id);
                    }
                }
            };

            let one = await Roles.create({ name: playlist, roles: rankroles });

            roles.push(one);
        };

        let two = await Roles.create({ name: 'Dividers', roles: dividers });
        roles.push(two);

        console.log('Roles created');
    }
    
    client.rankRoles = roles;
}