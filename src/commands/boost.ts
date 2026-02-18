import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { JamBoostService } from '../services/jamBoostService';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds';
import { config } from '../config';

export const data = new SlashCommandBuilder()
  .setName('boost')
  .setDescription('Activate your daily jam boost (15 mins, 3x points to others)');

export async function execute(interaction: ChatInputCommandInteraction, jamBoostService: JamBoostService): Promise<void> {
  await interaction.deferReply();

  try {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.editReply('This command can only be used in a server!');
      return;
    }

    const result = jamBoostService.activateBoost(userId, guildId);
    
    if (result.success) {
      const embed = createSuccessEmbed('Jam Boost Activated', result.message);

      // DEV log
      if (config.isDev) {
        console.log(`[DEV] Boost activated: ${userId} (${interaction.user.username}) expiresAt=${result.expiresAt}`);
      }

      await interaction.editReply({ embeds: [embed] });
    } else {
      const embed = createErrorEmbed(result.message);
      await interaction.editReply({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Error in boost command:', error);
    await interaction.editReply('An error occurred while activating your jam boost.');
  }
}
