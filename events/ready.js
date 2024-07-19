const { Events } = require('discord.js');
const updateRanks = require('../modules/updateRanks');
const createRoles = require('../modules/createRoles');
const twitch = require('../modules/twitch');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		client.log(`Ready! Logged in as ${client.user.tag}`);
		await createRoles(client);
		updateRanks(client);
		twitch(client);
	},
};