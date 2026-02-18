import { EmbedBuilder } from 'discord.js';
import { PlayerStats, LeaderboardEntry } from '../models';
import {
  POINTS_DISPLAY_DECIMALS,
  LEADERBOARD_DISPLAY_SIZE,
  EMBED_COLORS,
  BOOST_MULTIPLIER,
  UPGRADE_LEVEL_EPIC_THRESHOLD,
  UPGRADE_LEVEL_GREAT_THRESHOLD,
} from './constants';

export function createBreadStatusEmbed(stats: PlayerStats, username: string, showMaxPoints: boolean = false): EmbedBuilder {
  const currentPointsRounded = stats.player.currentPoints.toFixed(POINTS_DISPLAY_DECIMALS);
  const pointsDisplay = showMaxPoints 
    ? `${currentPointsRounded}/${stats.player.maxPoints}`
    : `${currentPointsRounded}/???`;
  
  const embed = new EmbedBuilder()
    .setColor(stats.isBoosted ? EMBED_COLORS.BOOST : EMBED_COLORS.INFO)
    .setTitle(`${username}'s Bread`)
    .addFields(
      { name: 'Bread Type', value: stats.aesthetic, inline: true },
      { name: 'Level', value: stats.player.breadLevel.toString(), inline: true },
      { name: 'Points', value: pointsDisplay, inline: true },
      { name: 'Jam Amount', value: stats.jamLevel, inline: false },
      { name: 'Jam Meter', value: stats.jamBar, inline: false }
    )
    .setTimestamp();

  if (stats.isBoosted) {
    embed.setDescription(`🔥 **JAM BOOST ACTIVE** - Giving ${BOOST_MULTIPLIER}x points to others!`);
  }
  
  // Add upgrade ranges if provided (test mode)
  if (stats.upgradeRanges && showMaxPoints) {
    const rangeText = stats.upgradeRanges
      .map(r => `${r.min}-${r.max}: ${r.levelBonus > 0 ? `+${r.levelBonus} lvl` : r.jamLevel}`)
      .join('\n');
    embed.addFields({ name: 'Upgrade Ranges (Test Mode)', value: `\`\`\`\n${rangeText}\n\`\`\``, inline: false });
  }

  return embed;
}

export function createUpgradeResultEmbed(
  success: boolean,
  levelsGained: number,
  newLevel: number,
  aesthetic: string,
  username: string
): EmbedBuilder {
  if (!success) {
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setTitle('❌ Not Ready to Upgrade')
      .setDescription('Your bread needs more points before it can level up!')
      .setTimestamp();
  }

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.SUCCESS)
    .setTitle('✨ Bread Upgraded!')
    .setDescription(`${username}'s bread gained **${levelsGained}** level${levelsGained > 1 ? 's' : ''}!`)
    .addFields(
      { name: 'New Level', value: newLevel.toString(), inline: true },
      { name: 'Bread Type', value: aesthetic, inline: true }
    )
    .setTimestamp();

  if (levelsGained >= UPGRADE_LEVEL_EPIC_THRESHOLD) {
    embed.setDescription(`${username}'s bread gained **${levelsGained}** levels! 🎉🎉🎉 Amazing timing!`);
  } else if (levelsGained >= UPGRADE_LEVEL_GREAT_THRESHOLD) {
    embed.setDescription(`${username}'s bread gained **${levelsGained}** levels! 🎉 Great timing!`);
  }

  return embed;
}

export function createLeaderboardEmbed(entries: LeaderboardEntry[], guildName: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.WARNING)
    .setTitle(`🏆 ${guildName} Bread Leaderboard`)
    .setTimestamp();

  if (entries.length === 0) {
    embed.setDescription('No bread levels yet! Start chatting to earn points!');
    return embed;
  }

  const medals = ['🥇', '🥈', '🥉'];
  const description = entries
    .slice(0, LEADERBOARD_DISPLAY_SIZE)
    .map((entry, index) => {
      const medal = index < 3 ? medals[index] : `${index + 1}.`;
      return `${medal} <@${entry.userId}> - **Level ${entry.breadLevel}** ${entry.aesthetic}`;
    })
    .join('\n');

  embed.setDescription(description);
  return embed;
}

export function createErrorEmbed(message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EMBED_COLORS.ERROR)
    .setTitle('❌ Error')
    .setDescription(message)
    .setTimestamp();
}

export function createSuccessEmbed(title: string, message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EMBED_COLORS.SUCCESS)
    .setTitle(`✅ ${title}`)
    .setDescription(message)
    .setTimestamp();
}

export function createPenaltyEmbed(username: string, levelsLost: number, oldLevel: number, newLevel: number, aesthetic: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EMBED_COLORS.BOOST)
    .setTitle('🍓 Too much jam!')
    .setDescription(`${username}'s bread got too much jam and dropped from **Level ${oldLevel} → ${newLevel}** (−${levelsLost}).\n\nYour points exceeded the maximum and the meter was reset. Upgrade earlier to avoid penalties!`)
    .addFields(
      { name: 'Old Level', value: oldLevel.toString(), inline: true },
      { name: 'New Level', value: newLevel.toString(), inline: true },
      { name: 'Bread Type', value: aesthetic, inline: true }
    )
    .setTimestamp();
}
