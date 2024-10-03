const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleremove')
    .setDescription('Remove a role from a member')
    .addUserOption(option =>
      option.setName('member')
        .setDescription('The member to remove the role from')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to remove from the member')
        .setRequired(true)),
  async execute(interaction) {
    const member = interaction.options.getMember('member');
    const role = interaction.options.getRole('role');

    if (!interaction.member.permissions.has('MANAGE_ROLES')) {
      return interaction.reply('You don\'t have the `MANAGE_ROLES` permission.');
    }

    if (!member) {
      return interaction.reply('Please provide a member to remove the role from.');
    }

    if (!role) {
      return interaction.reply('Please provide a role to remove from the member.');
    }

    if (!interaction.guild.members.me.permissions.has('MANAGE_ROLES')) {
      return interaction.reply('I don\'t have the `MANAGE_ROLES` permission.');
    }

    if (!member.roles.cache.has(role.id)) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setDescription(`Error ❌ | ${member.displayName} does not have this role!`);
      return interaction.reply({ embeds: [embed] });
    } else {
      await member.roles.remove(role.id).catch(e => console.log(e.message));
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setDescription(`Success ✅ | ${member} has been removed from **${role.name}**`);
      await interaction.reply({ embeds: [embed] });
    }
  },
};