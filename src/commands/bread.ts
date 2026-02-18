import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { GameService } from '../services/gameService';
import { createBreadStatusEmbed } from '../utils/embeds';

export const data = new SlashCommandBuilder()
  .setName('bread')
  .setDescription('Check your bread status and hotness level');

export async function execute(
  interaction: CommandInteraction, 
  gameService: GameService, 
  showMaxPoints: boolean = false
): Promise<void> {
  await interaction.deferReply();

  try {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.editReply('This command can only be used in a server!');
      return;
    }

    const stats = gameService.getPlayerStats(userId, guildId, showMaxPoints);
    const embed = createBreadStatusEmbed(stats, interaction.user.username, showMaxPoints);

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error in bread command:', error);
    await interaction.editReply('An error occurred while checking your bread status.');
  }
}
