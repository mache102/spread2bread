import { CommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import {
  BOOST_MULTIPLIER,
  BOOST_DURATION_MS,
  MS_PER_MINUTE,
  LEVEL_LOSS_PERCENTAGE,
  EMBED_COLORS,
} from '../utils/constants';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('View all available commands and how to use them');

export async function execute(interaction: CommandInteraction): Promise<void> {
  await interaction.deferReply();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.INFO)
    .setTitle('🍞 Spread2Bread Commands')
    .setDescription('Spread jam on your bread to level up and compete with others!')
    .addFields(
      {
        name: '📊 Game Commands',
        value: 
          '`/bread` - Check your bread level and jam meter\n' +
          '`/upgrade` - Attempt to level up your bread (timing is key!)\n' +
          '`/boost` - Activate your daily jam boost (' + BOOST_MULTIPLIER + 'x points, ' + (BOOST_DURATION_MS / MS_PER_MINUTE) + ' min)\n' +
          '`/leaderboard` - View the server\'s top bread masters',
        inline: false,
      },
      {
        name: '📖 Info Commands',
        value:
          '`/about` - Learn about the bot and see player count\n' +
          '`/help` - Show this help message',
        inline: false,
      },
      {
        name: '⚙️ Admin Commands',
        value:
          '`/admin enable` - Enable game in a channel\n' +
          '`/admin disable` - Disable game in a channel\n' +
          '`/admin list` - List active channels\n' +
          '`/admin give-points <amount>` - Modify a user\'s points\n' +
          '`/admin give-levels <amount>` - Modify a user\'s levels',
        inline: false,
      },
      {
        name: '🎮 How to Play',
        value:
          '1. Send messages in enabled channels\n' +
          '2. Earn points when others respond after you\n' +
          '3. Watch your jam meter fill up\n' +
          '4. Upgrade at the perfect moment for bonus levels\n' +
          '5. Compete for the #1 spot on the leaderboard!',
        inline: false,
      },
      {
        name: '⚡ Pro Tips',
        value:
          '• Jam ranges are randomized each upgrade\n' +
          '• Going over max points costs you ' + (LEVEL_LOSS_PERCENTAGE * 100) + '% of your levels!\n' +
          '• Use daily boost strategically to help everyone level faster\n' +
          '• Different bread aesthetics unlock at milestone levels',
        inline: false,
      }
    )
    .setFooter({ text: 'Type any command to get started!' })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
