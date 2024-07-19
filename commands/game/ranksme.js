const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');
const fs = require('fs');
const { fetchRanks, createRanksCanvas } = require('../../modules/functions')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ranksme')
		.setDescription('Returns your current ranks in Rocket League.\nWill only work if you have an account linked.'),
	async execute(interaction) {
		const userId = interaction.user.id;
		const user = await User.findOne({ id: userId });
		if (!user) user = await User.create({ id: interaction.user.id });
		if (!user.rlAcc || user.rlAcc == '') return interaction.reply({ content: `You don't have an account linked yet. Use the linkacc command to do this.` });

		interaction.reply({ content: `${interaction.client.customEmojis['loading']} Fetching your data...` });
		let rankData = await fetchRanks('epic', user.rlAcc);

		if (!rankData) {
            interaction.editReply({ content: `No data has been found, please relink your account using the linkacc command!` });
        } else {
            let img = await createRanksCanvas(rankData, 'epic', interaction.client);
            await interaction.editReply({ content: `${interaction.client.customEmojis['success']}  Here are your ranks.`, files: [`./${img}`] });
            fs.unlinkSync(`./${img}`);
        }
	},
};