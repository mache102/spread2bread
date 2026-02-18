import { Events, Message } from 'discord.js';
import { GameService } from '../services/gameService';
import { createPenaltyEmbed } from '../utils/embeds';
import { getAesthetic } from '../game/breadManager';

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
  const penalties = gameService.processMessage(
    message.id,
    message.channelId,
    message.guildId,
    message.author.id
  );
  
  // Send penalty notifications
  for (const penalty of penalties) {
    try {
      const aesthetic = getAesthetic(penalty.newLevel);
      const user = await message.client.users.fetch(penalty.userId);
      const embed = createPenaltyEmbed(user.username, penalty.levelsLost, penalty.newLevel, aesthetic);
      
      // Only send if channel supports sending messages
      if (message.channel.isTextBased() && 'send' in message.channel) {
        await message.channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Failed to send penalty notification:', error);
    }
  }
}
