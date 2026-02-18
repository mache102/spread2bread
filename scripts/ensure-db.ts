/**
 * ensure-db.ts
 *
 * Validates (and creates if missing) the SQLite database before the bot starts.
 * Exit code 0 = ready; exit code 1 = unrecoverable error.
 *
 * Run automatically via the `prestart` npm script, or manually:
 *   npx tsx scripts/ensure-db.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_PATH || './data/spread2bread.db';
const resolved = path.resolve(dbPath);

// ── 1. Ensure parent directory exists ────────────────────────────────────────
const dir = path.dirname(resolved);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`[ensure-db] Created directory: ${dir}`);
}

// ── 2. Open (or create) the database ─────────────────────────────────────────
// We import here (not at the top) so dotenv has already run.
// Using a direct import avoids pulling in all of src/storage/database.ts
// (which depends on config.ts and application code).
import Database from 'better-sqlite3';

let db: InstanceType<typeof Database>;
try {
  db = new Database(resolved);
  console.log(`[ensure-db] Opened: ${resolved}`);
} catch (err: any) {
  console.error(`[ensure-db] Failed to open database at ${resolved}: ${err.message}`);
  process.exit(1);
}

// ── 3. Probe write access ─────────────────────────────────────────────────────
try {
  db.exec('CREATE TABLE IF NOT EXISTS _db_check (id INTEGER PRIMARY KEY)');
  db.exec('DROP TABLE IF EXISTS _db_check');
  console.log('[ensure-db] Read/write check passed.');
} catch (err: any) {
  console.error(`[ensure-db] Database is not writable: ${err.message}`);
  db.close();
  process.exit(1);
}

db.close();
console.log('[ensure-db] Database is ready.');
