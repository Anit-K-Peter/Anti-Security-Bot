const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('undeafen')
    .setDescription('Undeafen a user in a voice channel')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to undeafen')
        .setRequired(true)),
  async execute(interaction) {
    const undeafenUser = interaction.options.getMember('user');

    if (!interaction.member.permissions.has('DEAFEN_MEMBERS')) {
      return interaction.reply('You don\'t have the `DEAFEN_MEMBERS` permission.');
    }

    if (!undeafenUser) {
      return interaction.reply('Please mention a user to undeafen.');
    }

    if (!interaction.guild.members.me.permissions.has('MANAGE_ROLES')) {
      return interaction.reply('I don\'t have the `DEAFEN_MEMBERS` permission.');
    }

    const embed = new EmbedBuilder()
      .setTitle('Undeafen Voice')
      .addFields(
        { name: 'Undeafen user:', value: undeafenUser.toString(), inline: true },
        { name: 'Undeafen by:', value: interaction.user.toString(), inline: true }
      )
      .setFooter(interaction.user.tag)
      .setTimestamp();

    await undeafenUser.voice.setDeaf(false);
    await interaction.reply({ embeds: [embed] });
  },
};