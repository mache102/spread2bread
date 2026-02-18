import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { GameService } from '../services/gameService';
import { createLeaderboardEmbed } from '../utils/embeds';

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('View the server bread leaderboard');

export async function execute(interaction: ChatInputCommandInteraction, gameService: GameService): Promise<void> {
  await interaction.deferReply();

  try {
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.editReply('This command can only be used in a server!');
      return;
    }

    const leaderboard = gameService.getLeaderboard(guildId, 10);
    const guildName = interaction.guild?.name || 'Server';
    const embed = createLeaderboardEmbed(leaderboard, guildName);

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error in leaderboard command:', error);
    await interaction.editReply('An error occurred while fetching the leaderboard.');
  }
}
