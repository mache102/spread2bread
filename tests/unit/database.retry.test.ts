/**
 * Tests for database stale-handle recovery (SQLITE_READONLY_DBMOVED).
 * getDatabase() silently reopens the connection when the underlying file
 * has been moved or deleted and surfaces a SQLITE_READONLY_DBMOVED error.
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { getDatabase, closeDatabase } from '../../src/storage/database';

describe('getDatabase stale-handle recovery', () => {
  beforeEach(() => closeDatabase());
  afterEach(() => closeDatabase());

  test('returns a writable in-memory database', () => {
    const db = getDatabase(':memory:');
    // Basic write probe
    db.exec('CREATE TABLE IF NOT EXISTS _test (id INTEGER PRIMARY KEY)');
    db.exec('INSERT INTO _test (id) VALUES (1)');
    const row = db.prepare('SELECT id FROM _test WHERE id = 1').get() as any;
    expect(row.id).toBe(1);
  });

  test('reopens connection after SQLITE_READONLY_DBMOVED is surfaced', () => {
    // Obtain a connection and manually inject the error so the probe throws it,
    // simulating what SQLite raises when the DB file is moved under the process.
    const first = getDatabase(':memory:');

    // Monkey-patch prepare so the probe in getDatabase throws the error once.
    let patchCalls = 0;
    const realPrepare = first.prepare.bind(first);
    (first as any).prepare = (sql: string) => {
      if (sql === 'SELECT 1' && patchCalls++ === 0) {
        const err: any = new Error('db moved');
        err.code = 'SQLITE_READONLY_DBMOVED';
        throw err;
      }
      return realPrepare(sql);
    };

    // Next call to getDatabase should detect the error and reopen.
    const second = getDatabase(':memory:');
    // Should be a fresh instance (SQLITE_READONLY_DBMOVED caused reopen)
    expect(second).not.toBe(first);
    // New connection should be writable
    second.exec('CREATE TABLE IF NOT EXISTS _test2 (id INTEGER PRIMARY KEY)');
    const row = second.prepare('SELECT 1 AS v').get() as any;
    expect(row.v).toBe(1);
  });
});

