import { Client, Collection, GatewayIntentBits, Events } from 'discord.js';
import { config, validateConfig } from './config';
import { GameService } from './services/gameService';
import { JamBoostService } from './services/jamBoostService';
import { getDatabase } from './storage/database';
import { createBoostExpiredEmbed } from './utils/embeds';
import { GuildRepository } from './storage/guildRepository';
import * as fs from 'fs';
import * as path from 'path';

// Validate configuration before proceeding
validateConfig();

interface Command {
  data: {
    name: string;
  };
  execute: (interaction: any, ...services: any[]) => Promise<void>;
}

interface EventModule {
  name: string;
  once?: boolean;
  execute: (...args: any[]) => void | Promise<void>;
}

// Initialize database
getDatabase();

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

// Initialize services
const gameService = new GameService();
const jamBoostService = new JamBoostService();

// Load commands
const commands = new Collection<string, Command>();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => (file.endsWith('.js') || (file.endsWith('.ts') && !file.endsWith('.d.ts'))));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath) as Command;
  if ('data' in command && 'execute' in command) {
    commands.set(command.data.name, command);
    console.log(`Loaded command: ${command.data.name}`);
  }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => (file.endsWith('.js') || (file.endsWith('.ts') && !file.endsWith('.d.ts'))));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath) as EventModule;
  
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    if (event.name === 'messageCreate') {
      client.on(event.name, (message) => event.execute(message, gameService));
    } else if (event.name === 'interactionCreate') {
      client.on(event.name, (interaction) => event.execute(interaction, commands, gameService, jamBoostService));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
  
  console.log(`Loaded event: ${event.name}`);
}

// Login
client.login(config.discordToken).catch(error => {
  console.error('Failed to login:', error);
  process.exit(1);
});

// After ready, start background tasks (boost-expiry notifier)
client.once(Events.ClientReady, () => {
  const jamBoostService = new JamBoostService();

  // Check every 60s for expired boosts we haven't notified yet
  setInterval(async () => {
    try {
      const expired = jamBoostService.getExpiredBoostPlayers();
      if (expired.length === 0) return;

      const guildRepo = new GuildRepository();

      for (const p of expired) {
        try {
          // Only notify if guild has expiry notifications enabled
          if (!guildRepo.isBoostExpiryEnabled(p.guildId)) {
            // Still clear so it won't persist as "expired" every check
            jamBoostService.clearBoostExpiration(p.userId, p.guildId);
            continue;
          }

          const user = await client.users.fetch(p.userId);
          const channelId = guildRepo.getBoostExpiryChannelId(p.guildId);

          if (channelId) {
            // Post in configured guild channel if available
            const ch = await client.channels.fetch(channelId).catch(() => null);
            if (ch?.isSendable()) {
              await ch.send({ embeds: [createBoostExpiredEmbed(user.username)] });
            } else {
              // fallback to DM
              await user.send({ embeds: [createBoostExpiredEmbed(user.username)] });
            }
          } else {
            // Default behavior: DM the user
            await user.send({ embeds: [createBoostExpiredEmbed(user.username)] });
          }

          // Clear the boost expiration so we don't notify again
          jamBoostService.clearBoostExpiration(p.userId, p.guildId);

          if (config.isDev) {
            console.log(`[DEV] Boost expired: ${p.userId} (${user.username})`);
          }
        } catch (err) {
          console.error('Failed to notify user about boost expiry:', err);
        }
      }
    } catch (err) {
      console.error('Error checking expired boosts:', err);
    }
  }, 60_000);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  client.destroy();
  process.exit(0);
});
