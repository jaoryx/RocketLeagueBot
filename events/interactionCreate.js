const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { authenticate } = require('../modules/auth');
const User = require('../models/User');
 
module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
        if (interaction.isButton() && interaction.customId == 'enterCode') {
            const modal = new ModalBuilder()
            .setCustomId('codeSubmitter')
			.setTitle('Link Epic Games account');

            const codeInput = new TextInputBuilder()
            .setCustomId('codeInput')
            .setLabel('Enter your authorization code')
            .setStyle(TextInputStyle.Short);

            modal.addComponents(new ActionRowBuilder().addComponents(codeInput))

            return interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId == 'codeSubmitter'){
            let code = interaction.fields.getTextInputValue('codeInput');       
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
        }

		if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
	},
};