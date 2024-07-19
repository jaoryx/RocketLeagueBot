const { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { CreateEmbed } = require('../../modules/functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sendlinkembed')
		.setDescription('Sends the embed to link an account')
        .addChannelOption(option => 
            option.setName('channel')
            .setDescription('The channel where the embed will be sent')
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
        const chosenChannel = interaction.options.getChannel('channel');

        let embed = CreateEmbed()
        .setDescription('Log into your Epic Games account on your browser first.\n'+
        'Click on the button below to get your authorization code.\n'+
        'Use the second button to enter your authorization code or use the /linkacc command to link it.')
        .setTitle('Link your Epic Games account');

        const linkButton = new ButtonBuilder()
        .setLabel('Get your confirmation code')
        .setURL('https://www.epicgames.com/id/api/redirect?clientId=ec684b8c687f479fadea3cb2ad83f5c6&responseType=code')
        .setStyle(ButtonStyle.Link)

        const connectButton = new ButtonBuilder()
        .setLabel('Enter authorization code')
        .setCustomId('enterCode')
        .setStyle(ButtonStyle.Secondary)

        const row = new ActionRowBuilder()
        .addComponents(linkButton, connectButton);

        chosenChannel.send({ embeds: [embed], components: [row] });

        interaction.reply({ content: `${interaction.client.customEmojis['success']} ${chosenChannel} has been set and an embed has been sent!` });
	},
};