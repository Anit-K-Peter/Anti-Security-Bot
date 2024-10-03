const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempmute')
    .setDescription('Temporary mute the mentioned user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to temporary mute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('time')
        .setDescription('The duration of the temporary mute')
        .setRequired(true)),
  async execute(interaction) {
    const tomute = interaction.options.getUser('user');
    const mutetime = interaction.options.getString('time');

    if (interaction.user.id === tomute.id) {
      return interaction.reply('You can\'t mute yourself!');
    }

    const muteRole = interaction.guild.roles.cache.find(val => val.name === "Muted By BLACK SYSTEM");
    if (!muteRole) {
      try {
        muteRole = await interaction.guild.roles.create({ data: {
          name: "Muted By BLACK SYSTEM",
          color: "#000000",
          permissions: []
        } });

        interaction.guild.channels.cache.forEach(async (channel, id) => {
          await channel.createOverwrite(muteRole, {
            SEND_MESSAGES: false,
            MANAGE_MESSAGES: false,
            READ_MESSAGES: false,
            ADD_REACTIONS: false
          });
        });
      } catch (e) {
        console.log(e.stack);
      }
    }

    if (!mutetime) {
      return interaction.reply('You didn\'t specify a time for temporary mute.');
    }

    const embed = new EmbedBuilder()
      .setColor(0x00FFFF)
      .setTimestamp()
      .addFields(
        { name: 'Action:', value: 'Temp Mute', inline: true },
        { name: 'User:', value: `${tomute.username}#${tomute.discriminator} (${tomute.id})`, inline: true },
        { name: 'Moderator:', value: interaction.user.username, inline: true },
        { name: 'Length', value: ms(ms(mutetime)), inline: true }
      )
      .setFooter('BLACK SECURITY');

    await interaction.reply({ embeds: [embed] });

    const member = interaction.guild.members.cache.get(tomute.id);
    member.roles.add(muteRole);

    setTimeout(function () {
      member.roles.remove(muteRole);
      interaction.channel.send(`<@${tomute.id}> has been unmuted`);
    }, ms(mutetime));
  },
};