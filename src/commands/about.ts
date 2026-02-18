import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { GameService } from '../services/gameService';
import { createSuccessEmbed } from '../utils/embeds';
import { POINT_DISTRIBUTION_WINDOW } from '../utils/constants';

export const data = new SlashCommandBuilder()
  .setName('about')
  .setDescription('Learn about Spread2Bread bot');

export async function execute(interaction: CommandInteraction, gameService: GameService): Promise<void> {
  await interaction.deferReply();

  try {
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.editReply('This command can only be used in a server!');
      return;
    }

    // Get player count in this guild
    const leaderboard = gameService.getLeaderboard(guildId, 1000); // Get all players
    const playerCount = leaderboard.length;
    const guildName = interaction.guild?.name || 'this server';

    const description = `
**Spread2Bread** is a competitive Discord game where players spread jam on their bread to level up!

📊 **${playerCount}** players in ${guildName}

**How It Works:**
• Send messages and jam points from the next ${POINT_DISTRIBUTION_WINDOW} messages sent by other users (you do **not** receive jam from your own message)
• Messages closer in time to yours 'spread' more jam points to your bread
• Build up points to upgrade your bread at the perfect moment
• Time your upgrades right for massive level bonuses
• Unlock aesthetic bread types as you level up

• Activate daily boost to spread 3x jam points to others for 15 minutes
• Compete on the server leaderboard for bread supremacy

**Get Started:**
Use \`/help\` to see all available commands!
    `;

    const embed = createSuccessEmbed('About Spread2Bread', description.trim());
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error in about command:', error);
    await interaction.editReply('An error occurred while fetching bot information.');
  }
}
