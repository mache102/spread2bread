# Discord Bot (Typescript)


typescript, nodejs, npm, better sqlite3 (may need to approve-build and rebuild), 
`src/` architecture:
```
commands  config.ts  events  game  index.ts  models  services  storage  utils
```
include top-level integration tests (tests /integration) and wrapper/patcher to test the same commands from cli. 

Concise implementation model :
- Command/event driven: `commands/` holds slash handlers, `events/` handles Discord events, `services/` contains business logic orchestration.
- Game core in `game/`
- Persistence: `storage/` uses better-sqlite3 repositories; tests run against a test DB.
- UI/embeds: `src/utils/embeds.ts` centralizes message formatting.
- Test harness: `tests/integration/*` plus `scripts/test-commands.ts` (CLI mock `test-cmd`) for end-to-end command testing.
- Admin & notifications: admin subcommands, notification-channel + per-user toggle, and simulate tools for resource testing.

- create `test-commands.ts` so that we can easily test the commands from CLI. 

cmds:
```
"build": "tsc",
"dev": "tsx watch src/index.ts",
"start": "node dist/index.js",
"deploy": "tsx scripts/deploy-commands.ts",
"test": "vitest",
"test-cmd": "tsx scripts/test-commands.ts"
```

test-cmd creates a mock cli and monkey patches a few other discord funcs; example:

```typescript
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

import * as readline from 'readline';
import { EmbedBuilder } from 'discord.js';
import { initDatabase } from '../src/storage/database';
import '../src/config';

// Import all commands
import * as about from '../src/commands/about';
import * as help from '../src/commands/help';
// ..

// Command registry - ADD NEW COMMANDS HERE
const COMMANDS: Record<string, any> = {
  about,
  help,
 
 ...
};

// Test user ID (you can change this)
const TEST_USER_ID = 'test_user_123';
const TEST_USERNAME = 'TestUser';

// Initialize database
initDatabase();

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
    const colorName = data.color === 0x00ff00 ? '[SUCCESS]' : 
                      data.color === 0xff0000 ? '[ERROR]' : 
                      data.color === 0xffa500 ? '[WARNING]' : 
                      '[INFO]';
    output = `${colorName} ${output}`;
  }
  
  return output;
}

// example of Mock Discord interaction - modify as needed
function buildMockInteraction(command: string, args: Record<string, any>): any {
  const embeds: EmbedBuilder[] = [];
  let contentOutput = '';
  let isEphemeral = false;
  
  return {
    user: {
      id: TEST_USER_ID,
      username: TEST_USERNAME,
      tag: `${TEST_USERNAME}#0000`,
    },
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
      getFocused: () => args._focused || '',
      getUser: (name: string, required?: boolean) => {
        const value = args[name];
        if (required && !value) throw new Error(`Missing required option: ${name}`);
        return value || null;
      },
      getChannel: (name: string, required?: boolean) => {
        const value = args[name];
        if (required && !value) throw new Error(`Missing required option: ${name}`);
        return value || null;
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
      
      // Output to console
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
    },
    editReply: async (payload: any) => {
      // Same as reply for testing
      if (payload.content) {
        contentOutput = payload.content;
      }
      if (payload.embeds) {
        embeds.push(...payload.embeds);
      }
      console.log('\n' + '═'.repeat(50));
      if (contentOutput) {
        console.log(contentOutput);
      }
      for (const embed of embeds) {
        console.log(embedToPlaintext(embed));
      }
      console.log('═'.repeat(50) + '\n');
    },
    deferReply: async () => {
      console.log('⏳ [Command processing...]');
    },
  };
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
  console.log('[bot name] - Command Testing CLI');
  console.log('═'.repeat(50));
  // print test user info...
  console.log('Type "exit" to quit, "/help" to see commands');
  console.log('═'.repeat(50) + '\n');
  
  while (true) {
    const input = await question('Command > ');
    const trimmed = input.trim();
    
    if (!trimmed) continue;
    if (trimmed === 'exit' || trimmed === 'quit') {
      console.log('👋 Goodbye!');
      rl.close();
      process.exit(0);
    }
    
    // Require slash prefix
    if (!trimmed.startsWith('/')) {
      console.log('❌ Commands must start with a slash (e.g., /help)\n');
      continue;
    }
    
    // Parse command (remove leading slash)
    const parts = trimmed.slice(1).split(/\s+/);
    const cmdName = parts[0];
    const cmdModule = COMMANDS[cmdName];
    
    if (!cmdModule) {
      console.log(`❌ Unknown command: /${cmdName}`);
      console.log('Type "/help" to see available commands\n');
      continue;
    }
    
    try {
      // Build arguments based on command
      const args: Record<string, any> = {};

      // ...

      // Create mock interaction
      const interaction = buildMockInteraction(cmdName, args);
      
      // Execute command
      await cmdModule.execute(interaction);
      
    } catch (error: any) {
      console.log(`\n❌ Error: ${error.message}\n`);
    }
  }
}

// Run
main().catch(console.error);

```