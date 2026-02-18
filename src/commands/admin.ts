import { CommandInteraction, SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { GameService } from '../services/gameService';
import { createSuccessEmbed, createErrorEmbed, createPenaltyEmbed } from '../utils/embeds';
import { getAesthetic } from '../game/breadManager';
import { GuildRepository } from '../storage/guildRepository';

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
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('give-points')
      .setDescription('Give or subtract points from a user')
      .addIntegerOption(option =>
        option
          .setName('amount')
          .setDescription('Amount of points to give (negative to subtract)')
          .setRequired(true)
      )
      .addUserOption(option =>
        option
          .setName('user')
          .setDescription('The user to modify (defaults to yourself)')
          .setRequired(false)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('give-levels')
      .setDescription('Give or subtract bread levels from a user')
      .addIntegerOption(option =>
        option
          .setName('amount')
          .setDescription('Amount of levels to give (negative to subtract, min level is 1)')
          .setRequired(true)
      )
      .addUserOption(option =>
        option
          .setName('user')
          .setDescription('The user to modify (defaults to yourself)')
          .setRequired(false)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('set-expiry-channel')
      .setDescription('Set channel for jam-boost expiry notifications')
      .addChannelOption(option =>
        option
          .setName('channel')
          .setDescription('Channel to post boost-expiry notifications in')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('disable-expiry-notifiers')
      .setDescription('Disable jam-boost expiry notifications for this guild')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('set-initial-maxpoints')
      .setDescription('Set the guild\'s initial max points used for randomization (min 10)')
      .addIntegerOption(option =>
        option
          .setName('amount')
          .setDescription('Initial max points (minimum 10)')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('show-points')
      .setDescription('View a user\'s current points and maxPoints')
      .addUserOption(option =>
        option
          .setName('user')
          .setDescription('User to view (defaults to yourself)')
          .setRequired(false)
      )
  );

export async function execute(interaction: CommandInteraction, gameService: GameService): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.editReply('This command can only be used in a server!');
      return;
    }

    if (!interaction.isChatInputCommand()) {
      await interaction.editReply('Invalid command type.');
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'enable') {
      const channel = interaction.options.getChannel('channel', true);

      gameService.enableChannel(channel.id, guildId);
      const embed = createSuccessEmbed(
        'Channel Enabled',
        `The bread game is now active in <#${channel.id}>`
      );
      await interaction.editReply({ embeds: [embed] });
    } else if (subcommand === 'disable') {
      const channel = interaction.options.getChannel('channel', true);

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
    } else if (subcommand === 'give-points') {
      const user = interaction.options.getUser('user') || interaction.user;
      const amount = interaction.options.getInteger('amount', true);

      const result = gameService.givePoints(user.id, guildId, amount);
      
      const actionText = amount >= 0 ? 'Added' : 'Subtracted';
      const absAmount = Math.abs(amount);
      const mainEmbed = createSuccessEmbed(
        'Points Modified',
        `${actionText} ${absAmount} points ${amount >= 0 ? 'to' : 'from'} ${user.username}\nNew points: ${result.newPoints}/${result.maxPoints}`
      );

      const embedsToSend = [mainEmbed];

      // If penalty applied, also include penalty embed in the reply so CLI shows it
      if (result.penaltyApplied) {
        const aesthetic = getAesthetic(result.newLevel ?? 1);
        const penaltyEmbed = createPenaltyEmbed(user.username, result.levelsLost ?? 0, result.oldLevel ?? 1, result.newLevel ?? 1, aesthetic);
        embedsToSend.push(penaltyEmbed);
      }

      await interaction.editReply({ embeds: embedsToSend });
    } else if (subcommand === 'give-levels') {
      const user = interaction.options.getUser('user') || interaction.user;
      const amount = interaction.options.getInteger('amount', true);

      const result = gameService.giveLevels(user.id, guildId, amount);
      
      const actionText = amount >= 0 ? 'Added' : 'Subtracted';
      const absAmount = Math.abs(amount);
      const embed = createSuccessEmbed(
        'Levels Modified',
        `${actionText} ${absAmount} level(s) ${amount >= 0 ? 'to' : 'from'} ${user.username}\nNew level: ${result.newLevel} ${result.aesthetic}`
      );
      await interaction.editReply({ embeds: [embed] });
    } else if (subcommand === 'set-expiry-channel') {
      const channel = interaction.options.getChannel('channel', true);
      const guildRepo = new GuildRepository();
      guildRepo.setBoostExpiryChannel(guildId, channel.id);

      const embed = createSuccessEmbed('Expiry Notifiers Enabled', `Boost-expiry notifications will be posted in <#${channel.id}>`);
      await interaction.editReply({ embeds: [embed] });
    } else if (subcommand === 'disable-expiry-notifiers') {
      const guildRepo = new GuildRepository();
      guildRepo.disableBoostExpiryNotifications(guildId);

      const embed = createSuccessEmbed('Expiry Notifiers Disabled', 'Boost-expiry notifications have been disabled for this guild.');
      await interaction.editReply({ embeds: [embed] });
    } else if (subcommand === 'set-initial-maxpoints') {
      const amount = interaction.options.getInteger('amount', true);
      const guildRepo = new GuildRepository();

      if (amount < 10) {
        const err = createErrorEmbed('initial max points must be at least 10');
        await interaction.editReply({ embeds: [err] });
        return;
      }

      guildRepo.setInitialMaxPoints(guildId, amount);
      const embed = createSuccessEmbed('Initial Max Points Updated', `New initial max points: **${amount}**`);
      await interaction.editReply({ embeds: [embed] });
    } else if (subcommand === 'show-points') {
      const user = interaction.options.getUser('user') || interaction.user;
      const stats = gameService.getPlayerStats(user.id, guildId, false);

      const embed = createSuccessEmbed('Player Points', `${user.username} — **${stats.player.currentPoints}/${stats.player.maxPoints}**`);
      await interaction.editReply({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Error in admin command:', error);
    await interaction.editReply('An error occurred while executing the admin command.');
  }
}
