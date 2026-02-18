/**
 * CLI Command Testing Tool
 * 
 * Test Discord commands from the command line without running the bot.
 * Mocks Discord interactions and converts embeds to plaintext output.
 * 
 * Usage:
 *   npm run test-cmd
 *   Then follow the interactive prompts
 * 
 * Adding New Commands:
 *   1. Import the command module
 *   2. Add to the COMMANDS object below
 *   3. If command has subcommands, handle in buildMockInteraction()
 */

// Set test mode BEFORE any imports to bypass env var requirements
process.env.TEST_MODE = '1';
process.env.DATABASE_PATH = ':memory:';

import * as readline from 'readline';
import { EmbedBuilder } from 'discord.js';
import { getDatabase } from '../src/storage/database';
import { GameService } from '../src/services/gameService';
import { JamBoostService } from '../src/services/jamBoostService';

// Import all commands
import * as bread from '../src/commands/bread';
import * as upgrade from '../src/commands/upgrade';
import * as leaderboard from '../src/commands/leaderboard';
import * as boost from '../src/commands/boost';
import * as admin from '../src/commands/admin';

// Command registry - ADD NEW COMMANDS HERE
const COMMANDS: Record<string, any> = {
  bread,
  upgrade,
  leaderboard,
  boost,
  admin,
};

// Test user ID (admin powers)
const TEST_USER_ID = 'test_user_123';
const TEST_USERNAME = 'TestAdmin';
const TEST_GUILD_ID = 'test_guild_456';
const TEST_CHANNEL_ID = 'test_channel_789';

// Initialize database and services
getDatabase();
const gameService = new GameService();
const jamBoostService = new JamBoostService();

// Enable the test channel by default
gameService.enableChannel(TEST_CHANNEL_ID, TEST_GUILD_ID);

// Embed to plaintext converter
function embedToPlaintext(embed: EmbedBuilder): string {
  const data = embed.toJSON();
  let output = '\n';
  
  if (data.title) {
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    output += `  ${data.title}\n`;
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  }
  
  if (data.description) {
    output += `${data.description}\n`;
  }
  
  if (data.fields && data.fields.length > 0) {
    output += `\n`;
    for (const field of data.fields) {
      output += `${field.name}\n`;
      output += `  ${field.value}\n\n`;
    }
  }
  
  if (data.footer) {
    output += `\n────────────────────────────────────────\n`;
    output += `${data.footer.text}\n`;
  }
  
  if (data.color) {
    const colorName = data.color === 0x2ECC71 ? '[SUCCESS]' : 
                      data.color === 0xE74C3C ? '[ERROR]' : 
                      data.color === 0xF39C12 ? '[WARNING]' : 
                      data.color === 0x3498DB ? '[INFO]' : 
                      data.color === 0xFF6B6B ? '[BOOST]' : 
                      '[INFO]';
    output = `${colorName} ${output}`;
  }
  
  return output;
}

// Mock Discord interaction
function buildMockInteraction(command: string, args: Record<string, any>): any {
  const embeds: EmbedBuilder[] = [];
  let contentOutput = '';
  let isEphemeral = false;
  
  return {
    user: {
      id: args._userId || TEST_USER_ID,
      username: TEST_USERNAME,
      tag: `${TEST_USERNAME}#0000`,
    },
    guild: {
      name: 'Test Server',
    },
    guildId: TEST_GUILD_ID,
    channelId: TEST_CHANNEL_ID,
    isChatInputCommand: () => true,
    options: {
      getString: (name: string, required?: boolean) => {
        const value = args[name];
        if (required && !value) throw new Error(`Missing required option: ${name}`);
        return value || null;
      },
      getInteger: (name: string, required?: boolean) => {
        const value = args[name];
        if (required && value === undefined) throw new Error(`Missing required option: ${name}`);
        return value !== undefined ? parseInt(value) : null;
      },
      getSubcommand: () => args.subcommand || null,
      getUser: (name: string, required?: boolean) => {
        const value = args[name];
        if (required && !value) return { id: TEST_USER_ID, username: TEST_USERNAME };
        return value ? { id: value, username: `User_${value}` } : null;
      },
      getChannel: (name: string, required?: boolean) => {
        const value = args[name];
        if (required && !value) return { id: TEST_CHANNEL_ID };
        return value ? { id: value } : null;
      },
    },
    reply: async (payload: any) => {
      if (payload.content) {
        contentOutput = payload.content;
      }
      if (payload.embeds) {
        embeds.push(...payload.embeds);
      }
      if (payload.ephemeral) {
        isEphemeral = true;
      }
      
      outputResult();
    },
    editReply: async (payload: any) => {
      if (payload.content) {
        contentOutput = payload.content;
      }
      if (payload.embeds) {
        embeds.length = 0; // Clear previous embeds
        if (payload.embeds) {
          embeds.push(...payload.embeds);
        }
      }
      
      outputResult();
    },
    deferReply: async (options?: any) => {
      if (options?.ephemeral) {
        isEphemeral = true;
      }
      // Silent for CLI
    },
  };
  
  function outputResult() {
    console.log('\n' + '═'.repeat(50));
    if (isEphemeral) {
      console.log('  [EPHEMERAL - Only visible to user]');
    }
    if (contentOutput) {
      console.log(contentOutput);
    }
    for (const embed of embeds) {
      console.log(embedToPlaintext(embed));
    }
    console.log('═'.repeat(50) + '\n');
  }
}

// Interactive CLI
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  const question = (prompt: string): Promise<string> => {
    return new Promise(resolve => rl.question(prompt, resolve));
  };
  
  console.clear();
  console.log('🍞 Spread2Bread - Command Testing CLI');
  console.log('═'.repeat(50));
  console.log(`Test User: ${TEST_USERNAME} (ID: ${TEST_USER_ID})`);
  console.log(`Test Guild: ${TEST_GUILD_ID}`);
  console.log(`Test Channel: ${TEST_CHANNEL_ID} (enabled)`);
  console.log('═'.repeat(50));
  console.log('Type "exit" to quit, "help" to see commands');
  console.log('Commands: /bread, /upgrade, /boost, /leaderboard');
  console.log('          /admin <subcommand> [options]');
  console.log('═'.repeat(50) + '\n');
  
  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('\n\n👋 Goodbye!');
    rl.close();
    process.exit(0);
  });
  
  while (true) {
    const input = await question('Command > ');
    const trimmed = input.trim();
    
    if (!trimmed) continue;
    if (trimmed === 'exit' || trimmed === 'quit') {
      console.log('👋 Goodbye!');
      rl.close();
      process.exit(0);
    }
    
    if (trimmed === 'help') {
      console.log('\n📋 Available Commands:');
      console.log('  /bread                           - Show your bread status');
      console.log('  /upgrade                         - Attempt to level up');
      console.log('  /boost                           - Activate jam boost');
      console.log('  /leaderboard                     - View server rankings');
      console.log('  /admin enable                    - Enable game in channel');
      console.log('  /admin disable                   - Disable game in channel');
      console.log('  /admin list                      - List active channels');
      console.log('  /admin give-points <amount>      - Give yourself points');
      console.log('  /admin give-levels <amount>      - Give yourself levels');
      console.log('\nExamples:');
      console.log('  /admin give-points 150           - Give yourself 150 points');
      console.log('  /admin give-levels 5             - Give yourself 5 levels');
      console.log('  /admin give-points -50           - Subtract 50 points\n');
      continue;
    }
    
    // Require slash prefix
    if (!trimmed.startsWith('/')) {
      console.log('❌ Commands must start with a slash (e.g., /bread)\n');
      continue;
    }
    
    // Parse command (remove leading slash)
    const parts = trimmed.slice(1).split(/\s+/);
    const cmdName = parts[0];
    const cmdModule = COMMANDS[cmdName];
    
    if (!cmdModule) {
      console.log(`❌ Unknown command: /${cmdName}`);
      console.log('Type "help" to see available commands\n');
      continue;
    }
    
    try {
      // Build arguments based on command
      const args: Record<string, any> = {};
      
      // Handle admin subcommands
      if (cmdName === 'admin') {
        if (parts.length < 2) {
          console.log('❌ Admin command requires a subcommand (enable, disable, list, give-points, give-levels)\n');
          continue;
        }
        args.subcommand = parts[1];
        
        // Handle give-points and give-levels
        if (args.subcommand === 'give-points' || args.subcommand === 'give-levels') {
          if (parts.length < 3) {
            console.log(`❌ ${args.subcommand} requires an amount\n`);
            continue;
          }
          args.amount = parts[2];
        }
      }
      
      // Create mock interaction
      const interaction = buildMockInteraction(cmdName, args);
      
      // Execute command with appropriate service
      if (cmdName === 'boost') {
        await cmdModule.execute(interaction, jamBoostService);
      } else {
        await cmdModule.execute(interaction, gameService);
      }
      
    } catch (error: any) {
      console.log(`\n❌ Error: ${error.message}\n`);
    }
  }
}

// Run
main().catch(console.error);
