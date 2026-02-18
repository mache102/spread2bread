import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { config } from './config';
import { GameService } from './services/gameService';
import { JamBoostService } from './services/jamBoostService';
import { getDatabase } from './storage/database';
import * as fs from 'fs';
import * as path from 'path';

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
    GatewayIntentBits.MessageContent,
  ],
});

// Initialize services
const gameService = new GameService();
const jamBoostService = new JamBoostService();

// Load commands
const commands = new Collection<string, Command>();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

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
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

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
