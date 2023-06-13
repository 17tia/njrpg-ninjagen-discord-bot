const fs = require('node:fs');
const { REST, Routes } = require('discord.js');
require('dotenv').config();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}
// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(TOKEN);

// and deploy your commands!
(async () => {
	try {
		// The put method is used to fully refresh all commands in the guild with the current set
		if (GUILD_ID) {
			const data = await rest.put(
				Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
				{ body: commands },
			);
			console.log(`ギルドコマンドの登録に成功 ${data.length} application (/) commands.`);
		} else {
			const data = await rest.put(
				Routes.applicationCommands(CLIENT_ID),
				{ body: commands },
			);
			console.log(`グローバルコマンドの登録に成功 ${data.length} application (/) commands.`);
		}
	}
	catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
