const { Collection } = require('discord.js');

module.exports = (client) => {
    client.antiCheat = {
        enabled: true,
        maxMessages: 10,
        maxEdits: 5,
        maxDeletes: 5,
        maxSpam: 5,
        whitelist: [],
        spamCooldown: new Collection()
    };

    client.on('messageCreate', async (message) => {
        if (!client.antiCheat.enabled) return;
        if (client.antiCheat.whitelist.includes(message.author.id)) return;
        if (message.author.id === client.user.id) return; // Don't delete the bot's own messages

        const links = client.antilinks.links;
        const suspiciousLinks = [];

        links.forEach((link) => {
            if (message.content.includes(link)) {
                suspiciousLinks.push(link);
            }
        });

        if (suspiciousLinks.length > 0) {
            await message.delete('Suspicious Link Detection: Message contains suspicious links');
            const logChannel = client.channels.cache.get(client.config.logChannelId);
            logChannel.send(`Deleted message from ${message.author.tag} for containing suspicious links`);
        }

        // Bad words detection
        const badWords = client.badwords.words;
        const badWordsFound = [];

        badWords.forEach((word) => {
            if (message.content.toLowerCase().includes(word.toLowerCase())) {
                badWordsFound.push(word);
            }
        });

        if (badWordsFound.length > 0) {
            await message.delete('Bad words detection: Message contains bad words');
            const logChannel = client.channels.cache.get(client.config.logChannelId);
            logChannel.send(`Deleted message from ${message.author.tag} for containing bad word`);
            message.channel.send(client.badwords.reply);
        }

        // Spam detection
        const spamCooldown = client.antiCheat.spamCooldown.get(message.author.id);

        if (!spamCooldown) {
            client.antiCheat.spamCooldown.set(message.author.id, {
                count: 1,
                timestamp: Date.now()
            });
        } else {
            spamCooldown.count++;
            spamCooldown.timestamp = Date.now();

            if (spamCooldown.count >= client.antiCheat.maxSpam) {
                if (Date.now() - spamCooldown.timestamp < 2000) { // 2-second cooldown
                    await message.delete('Anti-cheat: Spam detected');
                    const logChannel = client.channels.cache.get(client.config.logChannelId);
                    logChannel.send(`Deleted message from ${message.author.tag} for spamming`);
                    setTimeout(() => {
                        client.antiCheat.spamCooldown.delete(message.author.id);
                    }, 5000); // Reset cooldown after 5 seconds
                } else {
                    spamCooldown.count = 1;
                    spamCooldown.timestamp = Date.now();
                }
            }
        }
    });

    client.on('messageUpdate', async (oldMessage, newMessage) => {
        if (!client.antiCheat.enabled) return;
        if (client.antiCheat.whitelist.includes(newMessage.author.id)) return;
        if (newMessage.author.id === client.user.id) return; // Don't delete the bot's own messages

        const guild = newMessage.guild;
        const guildMessages = guild.messages.cache;

        if (guildMessages.size > guildMessages.size - client.antiCheat.maxEdits) {
            await newMessage.delete('Anti-cheat: Message edited too quickly');
            const logChannel = client.channels.cache.get(client.config.logChannelId);
            logChannel.send(`Deleted message from ${newMessage.author.tag} for editing too quickly`);
        }
    });

    client.on('messageDelete', async (message) => {
        try {
            if (!client.antiCheat.enabled) return;
            if (client.antiCheat.whitelist.includes(message.author.id)) return;
            if (!message.guild) return;
            if (message.author.id === client.user.id) return; // Don't delete the bot's own messages
    
            const guild = message.guild;
            const guildMessages = guild.channels.cache.get(message.channel.id).messages.cache;
    
            if (guildMessages.size > guildMessages.size - client.antiCheat.maxDeletes) {
                await message.channel.send('Anti-cheat: Message deleted too quickly');
                const logChannel = client.channels.cache.get(client.config.logChannelId);
                logChannel.send(`Deleted message from ${message.author.tag} for deleting too quickly`);
            }
        } catch (error) {
            console.error(error);
        }
    });
};