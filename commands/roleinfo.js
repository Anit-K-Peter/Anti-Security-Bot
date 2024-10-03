const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Shows stats of the mentioned role')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to show stats for')
        .setRequired(true)),
  async execute(interaction) {
    const role = interaction.options.getRole('role');

    if (!role) {
      return interaction.reply('Please provide a valid role!');
    }

    const status = {
      false: 'No',
      true: 'Yes'
    };

    const embed = new EmbedBuilder()
      .setColor('#2F3136')
      .setTitle(`Role Info: \`${role.name}\``)
      .setThumbnail(interaction.guild.iconURL())
      .addFields(
        { name: '**ID**', value: `\`${role.id}\``, inline: true },
        { name: '**Name**', value: role.name, inline: true },
        { name: '**Hex**', value: role.hexColor, inline: true },
        { name: '**Members**', value: role.members.size.toString(), inline: true },
        { name: '**Position**', value: role.position.toString(), inline: true },
        { name: '**Mentionable**', value: status[role.mentionable], inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};