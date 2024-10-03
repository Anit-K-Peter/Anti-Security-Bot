const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Sets slowmode for a channel')
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('The duration of slowmode in seconds')
        .setRequired(true)),
  async execute(interaction) {
    const duration = interaction.options.getInteger('duration');

    if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
      return interaction.reply('You don\'t have the `MANAGE_CHANNELS` permission.');
    }

    if (isNaN(duration)) {
      return interaction.reply('Please give a valid amount of time!');
    }

    if (duration > 21600) {
      return interaction.reply('You can\'t set the Slowmode higher than 21600 seconds.');
    }

    interaction.channel.setRateLimitPerUser(duration);

    const embed = new EmbedBuilder()
      .setColor('RANDOM')
      .setTitle('Slowmode Set!')
      .addFields(
        { name: 'Moderator', value: interaction.user.toString(), inline: true },
        { name: 'Time Set', value: `${duration} seconds`, inline: true }
      )
      .setFooter(`Requested by ${interaction.user.username}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};