import Database from 'better-sqlite3';
import { config } from '../config';

let db: Database.Database | null = null;
let dbPath: string | null = null;

/**
 * Return the active database connection. Opens (or reopens) the connection
 * as needed. If the underlying file was deleted/moved while the process was
 * running (SQLITE_READONLY_DBMOVED), the stale handle is silently closed and
 * a fresh connection to the same path is created — no retry wrappers needed
 * in callers.
 */
export function getDatabase(path?: string): Database.Database {
  const resolvedPath = path || dbPath || config.databasePath;

  if (db) {
    // Check whether the previously opened file still exists at the same path.
    // If not, close the stale handle so a new one is created below.
    try {
      // A zero-cost way to probe: run a trivial read-only query.
      db.prepare('SELECT 1').get();
    } catch (err: any) {
      if (err && err.code === 'SQLITE_READONLY_DBMOVED') {
        try { db.close(); } catch { /* ignore */ }
        db = null;
      } else {
        throw err;
      }
    }
  }

  if (!db) {
    dbPath = resolvedPath;
    db = new Database(resolvedPath);
    initializeSchema();
  }

  return db;
}

export function closeDatabase(): void {
  if (db) {
    try { db.close(); } catch { /* ignore */ }
    db = null;
  }
}

export function resetDatabase(): void {
  if (!db) return;
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
