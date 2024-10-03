const { Collection } = require('discord.js');

module.exports = (client) => {
    client.antiNuke = {
        enabled: true,
        maxChannels: 5,
        maxRoles: 5,
        maxBans: 5,
        maxKicks: 5,
        maxGuildUpdates: 5,
        whitelist: [],
        channelCreateCooldown: new Collection(),
        roleCreateCooldown: new Collection(),
        banAddCooldown: new Collection(),
        kickAddCooldown: new Collection(),
        guildUpdateCooldown: new Collection()
    };

    client.on('channelCreate', async (channel) => {
        if (!client.antiNuke.enabled) return;
        if (client.antiNuke.whitelist.includes(channel.guild.id)) return;

        const guild = channel.guild;
        const cooldown = client.antiNuke.channelCreateCooldown.get(guild.id);

        if (!cooldown) {
            client.antiNuke.channelCreateCooldown.set(guild.id, {
                count: 1,
                timestamp: Date.now()
            });
        } else {
            cooldown.count++;
            cooldown.timestamp = Date.now();

            if (cooldown.count >= client.antiNuke.maxChannels) {
                if (Date.now() - cooldown.timestamp < 60000) {
                    await channel.delete('Anti-nuke: Channel created too quickly');
                    const logChannel = client.channels.cache.get(client.config.logChannelId);
                    logChannel.send(`Deleted channel ${channel.name} for being created too quickly`);
                } else {
                    cooldown.count = 1;
                    cooldown.timestamp = Date.now();
                }
            }
        }
    });

    client.on('roleCreate', async (role) => {
        if (!client.antiNuke.enabled) return;
        if (client.antiNuke.whitelist.includes(role.guild.id)) return;

        const guild = role.guild;
        const cooldown = client.antiNuke.roleCreateCooldown.get(guild.id);

        if (!cooldown) {
            client.antiNuke.roleCreateCooldown.set(guild.id, {
                count: 1,
                timestamp: Date.now()
            });
        } else {
            cooldown.count++;
            cooldown.timestamp = Date.now();

            if (cooldown.count >= client.antiNuke.maxRoles) {
                if (Date.now() - cooldown.timestamp < 60000) {
                    await role.delete('Anti-nuke: Role created too quickly');
                    const logChannel = client.channels.cache.get(client.config.logChannelId);
                    logChannel.send(`Deleted role ${role.name} for being created too quickly`);
                } else {
                    cooldown.count = 1;
                    cooldown.timestamp = Date.now();
                }
            }
        }
    });

    client.on('guildBanAdd', async (ban) => {
        if (!client.antiNuke.enabled) return;
        if (client.antiNuke.whitelist.includes(ban.guild.id)) return;

        const guild = ban.guild;
        const cooldown = client.antiNuke.banAddCooldown.get(guild.id);

        if (!cooldown) {
            client.antiNuke.banAddCooldown.set(guild.id, {
                count: 1,
                timestamp: Date.now()
            });
        } else {
            cooldown.count++;
            cooldown.timestamp = Date.now();

            if (cooldown.count >= client.antiNuke.maxBans) {
                if (Date.now() - cooldown.timestamp < 60000) {
                    await ban.remove('Anti-nuke: Ban added too quickly');
                    const logChannel = client.channels.cache.get(client.config.logChannelId);
                    logChannel.send(`Removed ban for ${ban.user.tag} for being added too quickly`);
                } else {
                    cooldown.count = 1;
                    cooldown.timestamp = Date.now();
                }
            }
        }
    });

    client.on('guildKickAdd', async (kick) => {
        if (!client.antiNuke.enabled) return;
        if (client.antiNuke.whitelist.includes(kick.guild.id)) return;

        const guild = kick.guild;
        const cooldown = client.antiNuke.kickAddCooldown.get(guild.id);

        if (!cooldown) {
            client.antiNuke.kickAddCooldown.set(guild.id, {
                count: 1,
                timestamp: Date.now()
            });
        } else {
            cooldown.count++;
            cooldown.timestamp = Date.now();

            if (cooldown.count >= client.antiNuke.maxKicks) {
                if (Date.now() - cooldown.timestamp < 60000) {
                    await kick.remove('Anti-nuke: Kick added too quickly');
                    const logChannel = client.channels.cache.get(client.config.logChannelId);
                    logChannel.send(`Removed kick for ${kick.user.tag} for being added too quickly`);
                } else {
                    cooldown.count = 1;
                    cooldown.timestamp = Date.now();
                }
            }
        }
    });

    client.on(' guildUpdate', async (oldGuild, newGuild) => {
        if (!client.antiNuke.enabled) return;
        if (client.antiNuke.whitelist.includes(newGuild.id)) return;

        const cooldown = client.antiNuke.guildUpdateCooldown.get(newGuild.id);

        if (!cooldown) {
            client.antiNuke.guildUpdateCooldown.set(newGuild.id, {
                count: 1,
                timestamp: Date.now()
            });
        } else {
            cooldown.count++;
            cooldown.timestamp = Date.now();

            if (cooldown.count >= client.antiNuke.maxGuildUpdates) {
                if (Date.now() - cooldown.timestamp < 60000) {
                    await newGuild.leave('Anti-nuke: Guild updated too quickly');
                    const logChannel = client.channels.cache.get(client.config.logChannelId);
                    logChannel.send(`Left guild ${newGuild.name} for being updated too quickly`);
                } else {
                    cooldown.count = 1;
                    cooldown.timestamp = Date.now();
                }
            }
        }
    });
};