import { SlashCommandBuilder } from 'discord.js';

// Creates an Object in JSON with the data required by Discord's API to create a SlashCommand
const create = () => {
	const command = new SlashCommandBuilder()
		.setName('roll')
		.setDescription('WoW-like rolling')
		.addIntegerOption((option) => 
			option.setName('min').setDescription('From this to..'))
		.addIntegerOption((option) => 
			option.setName('max').setDescription("that"));

	return command.toJSON();
};

// Called by the interactionCreate event listener when the corresponding command is invoked
const invoke = (interaction) => {
	const min = interaction.options.get('min');
	const max = interaction.options.get('max');

	if (min !== null && max !== null && min.value < max.value) {
		let randNum = Math.floor(Math.random() * max.value) + min.value;
		interaction.reply({ 
			content: `${randNum}` 
		});
	} else {
		let randNum = Math.floor(Math.random() * 100) + 1;
		interaction.reply({
			content: `${randNum}`, 
		});
	}
};

export { create, invoke };
