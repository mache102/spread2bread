import { Events, Message } from 'discord.js';
import { GameService } from '../services/gameService';
import { createPenaltyEmbed } from '../utils/embeds';
import { getAesthetic } from '../game/breadManager';
import { config } from '../config';

export const name = Events.MessageCreate;

export async function execute(message: Message, gameService: GameService): Promise<void> {
  // Ignore bot messages
  if (message.author.bot) {
    return;
  }

  // Only process messages in guilds
  if (!message.guildId) {
    return;
  }

  // Process the message for point distribution
  const { penalties, gains } = gameService.processMessage(
    message.id,
    message.channelId,
    message.guildId,
    message.author.id
  );

  // DEV: log gains (userid + username) when isDev
  if (config.isDev && gains.length > 0) {
    for (const g of gains) {
      try {
        const user = await message.client.users.fetch(g.userId);
        console.log(`[DEV] Points: ${g.userId} (${user.username}) +${g.pointsAwarded.toFixed(2)} → ${g.newPoints}/${g.maxPoints}${g.boostActive ? ' [BOOST]' : ''}`);
      } catch (err) {
        console.log(`[DEV] Points: ${g.userId} +${g.pointsAwarded.toFixed(2)} → ${g.newPoints}/${g.maxPoints}`);
      }
    }
  }
  
  // Send penalty notifications and DEV log penalties
  for (const penalty of penalties) {
    try {
      const aesthetic = getAesthetic(penalty.newLevel);
      const user = await message.client.users.fetch(penalty.userId);
      const embed = createPenaltyEmbed(user.username, penalty.levelsLost, penalty.oldLevel, penalty.newLevel, aesthetic);
      
      // DEV log
      if (config.isDev) {
        console.log(`[DEV] Over-jam: ${penalty.userId} (${user.username}) lost ${penalty.levelsLost} levels ${penalty.oldLevel}→${penalty.newLevel}`);
      }
      
      // Only send if channel supports sending messages
      if (message.channel.isTextBased() && 'send' in message.channel) {
        await message.channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Failed to send penalty notification:', error);
    }
  }
}
