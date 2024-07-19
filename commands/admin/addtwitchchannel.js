const { SlashCommandBuilder } = require('discord.js');
const TwitchChannel = require('../../models/TwitchChannel');
const { GetChannelData } = require('../../modules/functions');
const { twitchClientId } = require('../../config.json'); 

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addtwitchchannel')
		.setDescription('Add a twitch channel for the live notifications')
        .addStringOption(option =>
            option.setName('channelname')
                .setDescription('Enter the channel name')
                .setRequired(true)
        ),
	async execute(interaction) {
        let channelName = interaction.options.getString('channelname'); 
        let twitchChannel = await TwitchChannel.findOne({ channelName });
        if (twitchChannel) return interaction.reply({ content: 'This channel is already added to the live notifications.' });

        const channelData = await GetChannelData(channelName, twitchClientId, interaction.client.twitchKey);
        if (!channelData) return interaction.reply({ content: `**${channelName}** does not exist!` });

        twitchChannel = await TwitchChannel.create({ channelName });
        interaction.reply(`${channelName} has been added to the live notifications!`);
	},
};