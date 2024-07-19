const { SlashCommandBuilder } = require('discord.js');
const TwitchChannel = require('../../models/TwitchChannel');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removetwitchchannel')
		.setDescription('Removes a twitch channel from the live notifications')
        .addStringOption(option =>
            option.setName('channelname')
                .setDescription('Enter the channel name')
                .setRequired(true)
        ),
	async execute(interaction) {
        let channelName = interaction.options.getString('channelname'); 
        let twitchChannel = await TwitchChannel.findOne({ channelName });
        if (!twitchChannel) return interaction.reply({ content: 'This channel is not set for live notifications' });

        await TwitchChannel.deleteOne({ channelName });
        interaction.reply(`${channelName} has been removed from the live notifications!`);
	},
};