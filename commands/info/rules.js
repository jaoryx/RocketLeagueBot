const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { CreateEmbed } = require('../../modules/functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rules')
		.setDescription('Sends an embed with the rules in it'),
	async execute(interaction) {
        const client = interaction.client;
        const channelId = interaction.channelId;
        const channel = await client.channels.fetch(channelId);
        
        let embed = CreateEmbed()
        .setTitle('Rules')
        .setDescription('We ask everyone to follow these rules.\n\n' +
        'They have been made so that people will respect each other and we can have this community setup together without any harrasment and bullying.\n\n' + 
        'Continuous violations of these rules will result in mutes, kicks and bans.\n\u200B')
        .setColor(client.color)
        .setFooter({ text: 'Rising Alliance', iconURL: client.logoURL })
        .setTimestamp()
        .addFields(
            { name: '・Harrasment', value: 'Harrasing, bullying or heavily insulting someone in the community is not allowed!' },
            { name: '・Discrimination', value: 'Discrimination or racism is not allowed on the server! We do understand that a joke can slip out here and there.' },
            { name: '・Sexual behavior', value: 'We are a friendly community among streamers and gamers. We do not allow anyone to harras somebody on any kind of sexual behavior.' },
            { name: '・Respect', value: 'Treat everyone with respect. Treat everyone with the same respect as they are giving towards you as well.' },
            { name: '・Staff', value: 'If u have a problem with a person or group let us know in a ticket, we will make sure that the problem is solved.' },
            { name: '・Language', value: 'Standard language here is English, we do understand that if u are with a group of friends that u speak another language.' },
            { name: '・Most important', value: "Have fun! We're all here to have a good time and built a great and big community for the Rocket League players." },
        );

        channel.send({ embeds: [embed] });

		interaction.reply({ content: 'The rules have been sent!', ephemeral: true });
	},
};