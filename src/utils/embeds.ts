import { EmbedBuilder } from 'discord.js';
import { PlayerStats, LeaderboardEntry } from '../models';

export function createBreadStatusEmbed(stats: PlayerStats, username: string, showMaxPoints: boolean = false): EmbedBuilder {
  const pointsDisplay = showMaxPoints 
    ? `${stats.player.currentPoints}/${stats.player.maxPoints}`
    : `${stats.player.currentPoints}/???`;
  
  const embed = new EmbedBuilder()
    .setColor(stats.isBoosted ? 0xFF6B6B : 0x3498DB)
    .setTitle(`${username}'s Bread`)
    .addFields(
      { name: 'Bread Type', value: stats.aesthetic, inline: true },
      { name: 'Level', value: stats.player.breadLevel.toString(), inline: true },
      { name: 'Points', value: pointsDisplay, inline: true },
      { name: 'Hotness', value: stats.hotnessLevel, inline: false },
      { name: 'Meter', value: stats.hotnessBar, inline: false }
    )
    .setTimestamp();

  if (stats.isBoosted) {
    embed.setDescription('🔥 **JAM BOOST ACTIVE** - Giving 3x points to others!');
  }
  
  // Add upgrade ranges if provided (test mode)
  if (stats.upgradeRanges && showMaxPoints) {
    const rangeText = stats.upgradeRanges
      .map(r => `${r.min}-${r.max}: ${r.levelBonus > 0 ? `+${r.levelBonus} lvl` : r.hotnessLevel}`)
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
      .setColor(0xE74C3C)
      .setTitle('❌ Not Ready to Upgrade')
      .setDescription('Your bread needs more points before it can level up!')
      .setTimestamp();
  }

  const embed = new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle('✨ Bread Upgraded!')
    .setDescription(`${username}'s bread gained **${levelsGained}** level${levelsGained > 1 ? 's' : ''}!`)
    .addFields(
      { name: 'New Level', value: newLevel.toString(), inline: true },
      { name: 'Bread Type', value: aesthetic, inline: true }
    )
    .setTimestamp();

  if (levelsGained >= 20) {
    embed.setDescription(`${username}'s bread gained **${levelsGained}** levels! 🎉🎉🎉 Amazing timing!`);
  } else if (levelsGained >= 10) {
    embed.setDescription(`${username}'s bread gained **${levelsGained}** levels! 🎉 Great timing!`);
  }

  return embed;
}

export function createLeaderboardEmbed(entries: LeaderboardEntry[], guildName: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0xF39C12)
    .setTitle(`🏆 ${guildName} Bread Leaderboard`)
    .setTimestamp();

  if (entries.length === 0) {
    embed.setDescription('No bread levels yet! Start chatting to earn points!');
    return embed;
  }

  const medals = ['🥇', '🥈', '🥉'];
  const description = entries
    .slice(0, 10)
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
    .setColor(0xE74C3C)
    .setTitle('❌ Error')
    .setDescription(message)
    .setTimestamp();
}

export function createSuccessEmbed(title: string, message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle(`✅ ${title}`)
    .setDescription(message)
    .setTimestamp();
}
