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
    try {
      db.close();
    } catch (err) {
      // ignore close errors
    }
    db = null;
  }
}

/**
 * Execute a callback with the active Database. If a write fails because the
 * underlying database file was moved/deleted (SQLite error code
 * `SQLITE_READONLY_DBMOVED`), close and reopen the database and retry once.
 */
export function withDatabaseRetry<T>(fn: (db: Database.Database) => T, retries = 1): T {
  try {
    const d = getDatabase();
    return fn(d);
  } catch (err: any) {
    // If the DB file was moved/deleted while process was running, better-sqlite3
    // surfaces SQLITE_READONLY_DBMOVED on subsequent writes. Recover by
    // closing and reopening the DB and retrying once.
    if (retries > 0 && err && err.code === 'SQLITE_READONLY_DBMOVED') {
      closeDatabase();
      const d = getDatabase();
      return fn(d);
    }
    throw err;
  }
}

export function resetDatabase(): void {
  if (!db) return;
  
  // Clear all tables
  db.exec(`
    DELETE FROM players;
    DELETE FROM tracked_messages;
    DELETE FROM channels;
  `);
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
      isActive INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (channelId, guildId)
    );

    CREATE INDEX IF NOT EXISTS idx_channels_guild 
      ON channels(guildId, isActive);

    -- Per-guild configuration (initial max points, boost expiry notifier)
    CREATE TABLE IF NOT EXISTS guild_settings (
      guildId TEXT NOT NULL PRIMARY KEY,
      initialMaxPoints INTEGER NOT NULL DEFAULT 300,
      boostExpiryChannelId TEXT,
      boostExpiryEnabled INTEGER NOT NULL DEFAULT 0
    );
  `);
}
