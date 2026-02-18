import { REST, Routes } from 'discord.js';
import { config, validateConfig } from '../src/config';
import * as fs from 'fs';
import * as path from 'path';

// Validate config before deploying
validateConfig();

interface Command {
  data: {
    toJSON: () => any;
  };
}

const commands: any[] = [];
const commandsPath = path.join(__dirname, '../src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath) as Command;
  if ('data' in command) {
    commands.push(command.data.toJSON());
    console.log(`Loaded command: ${file}`);
  }
}

const rest = new REST().setToken(config.discordToken);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    let data: any;
    
    if (config.guildId) {
      // Deploy to specific guild (faster for testing)
      data = await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: commands }
      );
      console.log(`Successfully deployed commands to guild ${config.guildId}`);
    } else {
      // Deploy globally (takes up to 1 hour to propagate)
      data = await rest.put(
        Routes.applicationCommands(config.clientId),
        { body: commands }
      );
      console.log('Successfully deployed commands globally');
    }

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('Error deploying commands:', error);
    process.exit(1);
  }
})();
