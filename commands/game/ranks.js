const { SlashCommandBuilder } = require('discord.js');
const { fetchRanks, createRanksCanvas } = require('../../modules/functions');
const fs = require('fs');
const User = require('../../models/User');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ranks')
		.setDescription('Will show you the ranks of another member or name given in the command.')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Select a member you want to see the ranks of')
        )
        .addStringOption(option =>
            option.setName('platform')
                .setDescription('Choose the platform the player plays on')
                .addChoices(
                    { name: 'Steam', value: 'steam' },
                    { name: 'Epic Games', value: 'epic' },
                    { name: 'PlayStation Network', value: 'psn' },
                    { name: 'Xbox Live', value: 'xbl' },
                    { name: 'Nintendo Switch', value: 'switch' },
                )
        )
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Enter the players name')
        ),
	async execute(interaction) {
        const client = interaction.client;
		const member = interaction.options.getUser('member');
        let platform, username;
        
        if (member) {
            if (member.bot) return interaction.reply({ content: "I don't think that this bot plays Rocket League...", ephemeral: true });
            const userId = member.id;
            const user = await User.findOne({ id: userId });
            if (!user) user = await User.create({ id: userId });
            username = user.rlAcc;
            if (!username || username == '') return interaction.reply({ content: `${member} has no Rocket League account linked to his Discord yet.` });
            platform = 'epic';
        } else {
            platform = interaction.options.getString('platform');
            username = interaction.options.getString('name');
            if (!platform || !username) return interaction.reply({ content: 'You need to select a member or enter a username and select their platform.', ephemeral: true })
        }

        if (!client.platformsNames[platform]) return interaction.reply({ content: 'Your platform is invalid!', ephemeral: true });

        interaction.reply({ content: `${client.customEmojis['loading']} Fetching data for **${username}** on platform ${client.platformsNames[platform]}` });

        let rankData = await fetchRanks(platform, username);
        
        if (!rankData) {
            interaction.editReply({ content: `No data has been found for **${username}**, please validate your input!` });
        } else {
            let img = await createRanksCanvas(rankData, platform, client);
            await interaction.editReply({ content: `${client.customEmojis['success']}  Here are the ranks from **${username}**`, files: [`./${img}`] });
            fs.unlinkSync(`./${img}`);
        }
	},
};