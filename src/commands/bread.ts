import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { GameService } from '../services/gameService';
import { createBreadStatusEmbed } from '../utils/embeds';

export const data = new SlashCommandBuilder()
  .setName('bread')
  .setDescription('Check your bread status and jam meter')
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('Optional: view another user\'s bread (won\'t ping them)')
      .setRequired(false)
  );

export async function execute(
  interaction: CommandInteraction,
  gameService: GameService,
  showMaxPoints: boolean = false
): Promise<void> {
  await interaction.deferReply();

  try {
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.editReply('This command can only be used in a server!');
      return;
    }

    const target = interaction.options.getUser('user') || interaction.user;
    const userId = target.id;
    const username = target.username;

    const stats = gameService.getPlayerStats(userId, guildId, showMaxPoints);
    const embed = createBreadStatusEmbed(stats, username, showMaxPoints);

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error in bread command:', error);
    await interaction.editReply('An error occurred while checking the bread status.');
  }
}
