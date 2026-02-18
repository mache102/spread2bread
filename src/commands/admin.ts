import { CommandInteraction, SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { GameService } from '../services/gameService';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds';

export const data = new SlashCommandBuilder()
  .setName('admin')
  .setDescription('Admin commands for managing the bread game')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand(subcommand =>
    subcommand
      .setName('enable')
      .setDescription('Enable the bread game in a channel')
      .addChannelOption(option =>
        option
          .setName('channel')
          .setDescription('The channel to enable')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('disable')
      .setDescription('Disable the bread game in a channel')
      .addChannelOption(option =>
        option
          .setName('channel')
          .setDescription('The channel to disable')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('list')
      .setDescription('List all enabled channels')
  );

export async function execute(interaction: CommandInteraction, gameService: GameService): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.editReply('This command can only be used in a server!');
      return;
    }

    const subcommand = interaction.options.data[0]?.name;

    if (subcommand === 'enable') {
      const channel = interaction.options.data[0].options?.[0].channel;
      if (!channel) {
        await interaction.editReply('Invalid channel provided.');
        return;
      }

      gameService.enableChannel(channel.id, guildId);
      const embed = createSuccessEmbed(
        'Channel Enabled',
        `The bread game is now active in <#${channel.id}>`
      );
      await interaction.editReply({ embeds: [embed] });
    } else if (subcommand === 'disable') {
      const channel = interaction.options.data[0].options?.[0].channel;
      if (!channel) {
        await interaction.editReply('Invalid channel provided.');
        return;
      }

      gameService.disableChannel(channel.id, guildId);
      const embed = createSuccessEmbed(
        'Channel Disabled',
        `The bread game is no longer active in <#${channel.id}>`
      );
      await interaction.editReply({ embeds: [embed] });
    } else if (subcommand === 'list') {
      const activeChannels = gameService.getActiveChannels(guildId);
      
      if (activeChannels.length === 0) {
        const embed = createErrorEmbed('No channels are currently enabled for the bread game.');
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const channelList = activeChannels.map(id => `<#${id}>`).join('\n');
      const embed = createSuccessEmbed('Active Channels', channelList);
      await interaction.editReply({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Error in admin command:', error);
    await interaction.editReply('An error occurred while executing the admin command.');
  }
}
