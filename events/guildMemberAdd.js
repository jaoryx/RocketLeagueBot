const { Events } = require('discord.js');
const User = require('../models/User');
 
module.exports = {
	name: Events.GuildMemberAdd,
	once: false,
	async execute(member) {
		let userData = await User.findOne({ id: member.user.id });
        if (!userData) await User.create({ id: member.user.id });
	},
};