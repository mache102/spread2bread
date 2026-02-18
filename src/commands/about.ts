import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { GameService } from '../services/gameService';
import { createSuccessEmbed } from '../utils/embeds';
import { POINT_DISTRIBUTION_WINDOW, MAX_LEADERBOARD_FETCH, BOOST_MULTIPLIER, MS_PER_MINUTE, BOOST_DURATION_MS } from '../utils/constants';

export const data = new SlashCommandBuilder()
  .setName('about')
  .setDescription('Learn about Spread2Bread bot');

export async function execute(interaction: ChatInputCommandInteraction, gameService: GameService): Promise<void> {
  await interaction.deferReply();

  try {
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.editReply('This command can only be used in a server!');
      return;
    }

    // Get player count in this guild
    const leaderboard = gameService.getLeaderboard(guildId, MAX_LEADERBOARD_FETCH); // Get all players
    const playerCount = leaderboard.length;
    const guildName = interaction.guild?.name || 'this server';

    const description = `
**Spread2Bread** is a competitive Discord game where players spread jam on their bread to level up!

📊 **${playerCount}** players in ${guildName}

**How It Works:**
• Chat regularly - the next ${POINT_DISTRIBUTION_WINDOW} messages will 'spread' jam points to your bread
• Messages closer to yours give you more points
• Upgrade your bread at the perfect moment of points for massive level bonuses
• Unlock aesthetic bread types as you level up

• Activate daily boost to spread ${BOOST_MULTIPLIER}x jam points to others for ${BOOST_DURATION_MS / MS_PER_MINUTE} minutes
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
