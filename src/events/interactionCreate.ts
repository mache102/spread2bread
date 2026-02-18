import { Events, Interaction, Collection } from 'discord.js';
import { GameService } from '../services/gameService';
import { JamBoostService } from '../services/jamBoostService';

interface Command {
  data: {
    name: string;
  };
  execute: (interaction: Interaction, ...services: any[]) => Promise<void>;
}

export const name = Events.InteractionCreate;

export async function execute(
  interaction: Interaction,
  commands: Collection<string, Command>,
  gameService: GameService,
  jamBoostService: JamBoostService
): Promise<void> {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    // Route to correct service based on command
    if (interaction.commandName === 'boost') {
      await command.execute(interaction, jamBoostService);
    } else {
      await command.execute(interaction, gameService);
    }
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);
    
    const replyOptions = { 
      content: 'There was an error while executing this command!', 
      ephemeral: true 
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyOptions);
    } else {
      await interaction.reply(replyOptions);
    }
  }
}
