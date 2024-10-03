const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleadd')
    .setDescription('Add a role to a member')
    .addUserOption(option =>
      option.setName('member')
        .setDescription('The member to add the role to')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to add to the member')
        .setRequired(true)),
  async execute(interaction) {
    const member = interaction.options.getMember('member');
    const role = interaction.options.getRole('role');

    if (!interaction.member.permissions.has('MANAGE_ROLES')) {
      return interaction.reply('You don\'t have the `MANAGE_ROLES` permission.');
    }

    if (!member) {
      return interaction.reply('Please provide a member to add the role to.');
    }

    if (!role) {
      return interaction.reply('Please provide a role to add to the member.');
    }

    if (!interaction.guild.members.me.permissions.has('MANAGE_ROLES')) {
      return interaction.reply('I don\'t have the `MANAGE_ROLES` permission.');
    }

    if (member.roles.cache.has(role.id)) {
      return interaction.reply(`${member.displayName} already has the role!`);
    } else {
      await member.roles.add(role.id).catch(e => console.log(e.message));
      const embed = new EmbedBuilder()
        .setTitle('Role Added')
        .addFields(
          { name: 'Member:', value: member.toString(), inline: true },
          { name: 'Role:', value: role.toString(), inline: true }
        );
      await interaction.reply({ embeds: [embed] });
    }
  },
};