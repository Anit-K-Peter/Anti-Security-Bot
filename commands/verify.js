const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('verification embed with button'),
    async execute(interaction) {
        try {
            // Generate a verification code
            const verificationCode = generateVerificationCode();

            // Store the verification code in a database or a file
            // For this example, we will use a simple object to store the code
            const verificationCodes = {};
            verificationCodes[interaction.user.id] = verificationCode;

            // Send verification embed with button
            const embed = new EmbedBuilder()
                .setTitle('Enter Verification Code')
                .setDescription('Please click the button below to enter the verification code.')
                .setColor('#0099ff')
                .toJSON();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('verify')
                        .setLabel('Verify')
                        .setStyle(ButtonStyle.Primary)
                )
                .toJSON();

            const sentMessage = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

            const filter = i => i.customId === 'verify' && i.user.id === interaction.user.id;

            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async interaction => {
                // Send a DM to the user with the verification code
                await interaction.user.send(`Your verification code is: ${verificationCode}`, { ephemeral: true });

                // Edit the original message to remove the button
                await interaction.update({ embeds: [new EmbedBuilder().setTitle('Verification Code Sent').setDescription('Please check your DMs for the verification code.').setColor('#0099ff').toJSON()], components: [] });

                // Send a message to the user with a button to enter the code
                const enterCodeEmbed = new EmbedBuilder()
                    .setTitle('Enter Verification Code')
                    .setDescription('Please click the button below to enter the verification code.')
                    .setColor('#0099ff')
                    .toJSON();

                const enterCodeRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('open_modal')
                            .setLabel('Enter Code')
                            .setStyle(ButtonStyle.Primary)
                    )
                    .toJSON();

                const enterCodeMessage = await interaction.channel.send({ embeds: [enterCodeEmbed], components: [enterCodeRow], ephemeral: true });

                // Create a collector for the button interaction
                const filter = i => i.customId === 'open_modal' && i.user.id === interaction.user.id;
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async buttonInteraction => {
                    // Create and show the modal
                    const modal = new ModalBuilder()
                        .setCustomId('verify_modal')
                        .setTitle('Enter Verification Code')
                        .addComponents(
                            new ActionRowBuilder().addComponents(
                                new TextInputBuilder()
                                    .setCustomId('verification_code')
                                    .setLabel('Verification Code')
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(true)
                            )
                        );

                    await buttonInteraction.showModal(modal);
                });

                collector.on('end', () => {
                    enterCodeMessage.components[0].components[0].setDisabled(true);
                    enterCodeMessage.edit({ components: enterCodeMessage.components });
                });
            });

            interaction.client.on('interactionCreate', async modalInteraction => {
                try {
                    if (!modalInteraction.isModalSubmit() || modalInteraction.customId !== 'verify_modal') return;

                    const typedCode = modalInteraction.fields.getTextInputValue('verification_code').trim();
                    const verificationCode = verificationCodes[modalInteraction.user.id];

                    if (typedCode === verificationCode) {
                        const role = interaction.guild.roles.cache.get('1291344332120391690'); // Replace with your role ID
                        if (!role) {
                            await modalInteraction.reply({ content: 'Role not found. Please contact an administrator.', ephemeral: true });
                            return;
                        }
                        const member = interaction.guild.members.cache.get(modalInteraction.user.id);
                        await member.roles.add(role);
                        await modalInteraction.reply({ content: 'You have been verified and granted the role!', ephemeral: true });

                        // Send successful verification DM
                        await modalInteraction.user.send('Congratulations! You have been successfully verified.');
                    } else {
                        await modalInteraction.reply({ content: 'Incorrect code. Please try again.', ephemeral: true });
                    }
                } catch (error) {
                    console.error(error);
                    modalInteraction.reply({ content: 'An error occurred while verifying your code.', ephemeral: true });
                }
            });
        } catch (error) {
            console.error(error);
            interaction.reply('An error occurred while sending the verification embed.');
        }
    },
};

function generateVerificationCode() {
    // Generate a random verification code
    return Math.floor(100000 + Math.random() * 900000).toString();
}