const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const { token, clientId, guildId, logChannelId } = require('./config');
const { printWatermark } = require("./data/pw.js");
const antilinks = require('./data/antilinks.json');
const badwords = require('./data/badwords.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

client.commands = new Collection();
client.config = {
    token: token,
    clientId: clientId,
    guildId: guildId,
    logChannelId: logChannelId
};
client.antilinks = antilinks;
client.badwords = badwords;

// Load commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    console.log(`Command loaded: ${command.data.name}`);
}

// Load anti-nuke and anti-cheat systems
const antinuke = require('./anti/antinuke.js');
const anticheat = require('./anti/anticheat.js');
antinuke(client);
anticheat(client);


client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const commands = client.commands.map(command => command.data);
    try {
        await client.application.commands.set(commands, guildId);
        console.log('Slash commands registered successfully!');
    } catch (error) {
        console.error('Error registering slash commands:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Error executing command:', error);
        await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
    }
});

client.login(token);