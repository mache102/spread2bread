import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { GameService } from '../services/gameService';
import { createUpgradeResultEmbed } from '../utils/embeds';
import { config } from '../config';

export const data = new SlashCommandBuilder()
  .setName('upgrade')
  .setDescription('Attempt to level up your bread');

export async function execute(interaction: ChatInputCommandInteraction, gameService: GameService): Promise<void> {
  await interaction.deferReply();

  try {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.editReply('This command can only be used in a server!');
      return;
    }

    const result = gameService.upgradePlayerBread(userId, guildId);
    const embed = createUpgradeResultEmbed(
      result.success,
      result.levelsGained,
      result.newLevel,
      result.aesthetic,
      interaction.user.username
    );

    // DEV log
    if (config.isDev) {
      console.log(`[DEV] Upgrade: ${userId} (${interaction.user.username}) ${result.success ? `+${result.levelsGained} → ${result.newLevel}` : 'not ready'}`);
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error in upgrade command:', error);
    await interaction.editReply('An error occurred while upgrading your bread.');
  }
}
