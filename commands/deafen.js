const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deafen')
    .setDescription('Deafen a user in a voice channel')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to deafen')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for deafening the user')
        .setRequired(false)),
  async execute(interaction) {
    const deafUser = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason');

    if (!interaction.member.permissions.has('DEAFEN_MEMBERS')) {
      return interaction.reply('You don\'t have the `DEAFEN_MEMBERS` permission.');
    }

    if (!deafUser) {
      return interaction.reply('Please mention a user to deafen.');
    }

    if (!interaction.guild.members.me.permissions.has('MANAGE_ROLES')) {
      return interaction.reply('I don\'t have the `DEAFEN_MEMBERS` permission.');
    }

    const embed = new EmbedBuilder()
      .setTitle('Deafen Voice')
      .addFields(
        { name: 'Deafen user:', value: deafUser.toString(), inline: true },
        { name: 'Deafen by:', value: interaction.user.toString(), inline: true }
      );

    if (reason) {
      embed.addFields({ name: 'Reason:', value: reason, inline: true });
    }

    await deafUser.voice.setDeaf(true);
    await interaction.reply({ embeds: [embed] });
  },
};