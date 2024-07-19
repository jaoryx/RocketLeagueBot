const { SlashCommandBuilder } = require('discord.js');
const { authenticate } = require('../../modules/auth');
const User = require('../../models/User');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('linkacc')
		.setDescription('Link your epic account with the autorization code')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Enter your authorization code')
                .setRequired(true)
        ),
	async execute(interaction) {
		let code = interaction.options.getString('code');       
        let ret = await authenticate(code);

        if (!ret.success) {
            return interaction.reply({ content: `${interaction.client.customEmojis['error']} This is an invalid code. Get your code from [here](https://www.epicgames.com/id/api/redirect?clientId=ec684b8c687f479fadea3cb2ad83f5c6&responseType=code) and retry!`, ephemeral: true })
        } else {
            let user = await User.findOne({ id: interaction.user.id });
            if (!user) {
                await User.create({ id: interaction.user.id, rlAcc: ret.message });
            } else {
                user.rlAcc = ret.message;
                await user.save();
            }
            interaction.reply({ content: `${interaction.client.customEmojis['success']} Your Epic Account ${ret.message} has been authenticated and added to your Discord!`, ephemeral: true })
        }
	},
};