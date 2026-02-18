import { Events, Message } from 'discord.js';
import { GameService } from '../services/gameService';

export const name = Events.MessageCreate;

export function execute(message: Message, gameService: GameService): void {
  // Ignore bot messages
  if (message.author.bot) {
    return;
  }

  // Only process messages in guilds
  if (!message.guildId) {
    return;
  }

  // Process the message for point distribution
  gameService.processMessage(
    message.id,
    message.channelId,
    message.guildId,
    message.author.id
  );
}
