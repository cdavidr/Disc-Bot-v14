import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet('1GEmFaY7aZQ2UHHzrY1_5wGZjrCa5VOddQU5b1aPXRQc');
await doc.useServiceAccountAuth({
	// env var values are copied from service account credentials generated by google
	// see "Authentication" section in docs for more info
	client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
	private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
});

await doc.loadInfo(); // loads document properties and worksheets
console.log(doc.title);

const sheet = doc.sheetsByIndex[0];
await sheet.loadCells(); // loads range of cells into local cache - DOES NOT RETURN THE CELLS
console.log(sheet.cellStats); // total cells, loaded, how many non-empty

const rows = await sheet.getRows({offset: 0});
const numOfMembers = rows.length;
console.log(numOfMembers);

// Creates an Object in JSON with the data required by Discord's API to create a SlashCommand
const create = () => {
	const command = new SlashCommandBuilder()
		.setName('pick')
		.setDescription('Pick x people from google sheets randomly')
		.addIntegerOption((option) => 
			option.setName('amount').setDescription('How many?').setRequired(true));

	return command.toJSON();
};

// Called by the interactionCreate event listener when the corresponding command is invoked
const invoke = (interaction) => {
	const guild = interaction.guild;
	let pickAmount = interaction.options.get('amount');
	let randomizedSpots = new Array(numOfMembers).fill().map((a, i) => a = i).sort(() => Math.random() - 0.5);
	let winners = randomizedSpots.slice(0, pickAmount.value);
	let winnersText = "";
	let tagged = "";
	let members = interaction.guild.members.fetch();
	console.log(members);
	for (const idx of winners) {
		winnersText += rows[idx].Discord + "," + rows[idx]['Default Burner'] + "\n";
		let user = members.find(user => user.tag == rows[idx].Discord);
		tagged += `${user}` + " ";
	}

	// Create a MessageEmbed and add an inlined field for each property displayed in the reply message
	const embed = new EmbedBuilder().setTitle(guild.name).addFields([
		{
			name: 'Winners',
			value: winnersText,
			inline: true,
		},
	]);

	// Edit some properties of the embed to make it a bit prettier
	// Note: This could be done at the creation of the object, but I split it to make it a bit clearer
	// #shamelessSelfpromotion
	embed
		.setColor('Aqua')
		.setTimestamp()
		.setAuthor({
			name: 'Random Giveaway',
		})
		.setImage(guild.iconURL());

	// Reply to the user
	interaction.reply({
		embeds: [embed],
		content: "Tagging " + tagged
	});
};

export { create, invoke };
