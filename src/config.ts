import dotenv from 'dotenv';

dotenv.config();

export const config = {
  discordToken: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  guildId: process.env.GUILD_ID || '',
  databasePath: process.env.DATABASE_PATH || './data/spread2bread.db',
  // isDev: true when running `npm run dev` (NODE_ENV=development) or when DEV=1
  isDev: (process.env.NODE_ENV === 'development') || process.env.DEV === '1' || process.env.TEST_MODE === '1',
};

export function validateConfig(): void {
  if (!config.discordToken || !config.clientId) {
    throw new Error('Missing required environment variables: DISCORD_TOKEN and CLIENT_ID');
  }
}
