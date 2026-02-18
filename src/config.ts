import dotenv from 'dotenv';

dotenv.config();

export const config = {
  discordToken: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  guildId: process.env.GUILD_ID || '',
  databasePath: process.env.DATABASE_PATH || './data/spread2bread.db',
};

export function validateConfig(): void {
  if (!config.discordToken || !config.clientId) {
    throw new Error('Missing required environment variables: DISCORD_TOKEN and CLIENT_ID');
  }
}
