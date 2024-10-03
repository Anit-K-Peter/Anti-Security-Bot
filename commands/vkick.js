const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vkick')
    .setDescription('Kick a user from a voice channel')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to kick from the voice channel')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.guild.me.permissions.has('ADMINISTRATOR')) {
      return interaction.reply('I don\'t have the `ADMINISTRATOR` permission.');
    }

    const user = interaction.options.getUser('user');
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply('Please mention a valid user!');
    }

    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply('This person is not connected to a voice channel!');
    }

    await voiceChannel.members.kick(member);

    const embed = new EmbedBuilder()
      .setTitle('Voice Kick')
      .addFields(
        { name: 'User:', value: member.toString(), inline: true },
        { name: 'Kicked by:', value: interaction.user.toString(), inline: true }
      )
      .setFooter(interaction.user.tag)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};