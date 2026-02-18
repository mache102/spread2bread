import Database from 'better-sqlite3';
import { config } from '../config';

let db: Database.Database | null = null;

export function getDatabase(dbPath?: string): Database.Database {
  if (!db) {
    db = new Database(dbPath || config.databasePath);
    initializeSchema();
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

function initializeSchema(): void {
  if (!db) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      userId TEXT NOT NULL,
      guildId TEXT NOT NULL,
      breadLevel INTEGER NOT NULL DEFAULT 1,
      currentPoints INTEGER NOT NULL DEFAULT 0,
      maxPoints INTEGER NOT NULL DEFAULT 300,
      lastUpgradeAt INTEGER NOT NULL DEFAULT 0,
      lastBoostUsed INTEGER NOT NULL DEFAULT 0,
      boostExpiresAt INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (userId, guildId)
    );

    CREATE TABLE IF NOT EXISTS tracked_messages (
      messageId TEXT NOT NULL,
      channelId TEXT NOT NULL,
      guildId TEXT NOT NULL,
      userId TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (messageId)
    );

    CREATE INDEX IF NOT EXISTS idx_tracked_messages_channel 
      ON tracked_messages(channelId, timestamp DESC);

    CREATE TABLE IF NOT EXISTS channels (
      channelId TEXT NOT NULL,
      guildId TEXT NOT NULL,
      isActive INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (channelId, guildId)
    );

    CREATE INDEX IF NOT EXISTS idx_channels_guild 
      ON channels(guildId, isActive);
  `);
}
