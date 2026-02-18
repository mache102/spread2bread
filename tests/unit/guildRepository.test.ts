import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { getDatabase, resetDatabase, closeDatabase } from '../../src/storage/database';
import { GuildRepository } from '../../src/storage/guildRepository';

describe('GuildRepository', () => {
  let repo: GuildRepository;

  beforeAll(() => {
    process.env.DATABASE_PATH = ':memory:';
    getDatabase();
    resetDatabase();
    repo = new GuildRepository();
  });

  afterAll(() => {
    resetDatabase();
    closeDatabase();
  });

  test('defaults: boostExpiryEnabled is false and initialMaxPoints default', () => {
    const s = repo.getSettings('g-default');
    expect(s.boostExpiryEnabled).toBe(false);
    expect(s.initialMaxPoints).toBe(300);
  });

  test('setBoostExpiryChannel enables notifications and stores channel id', () => {
    repo.setBoostExpiryChannel('g-chan', 'ch-123');
    const s = repo.getSettings('g-chan');
    expect(s.boostExpiryEnabled).toBe(true);
    expect(s.boostExpiryChannelId).toBe('ch-123');
  });

  test('disableBoostExpiryNotifications clears channel and disables notifications', () => {
    repo.disableBoostExpiryNotifications('g-chan');
    const s = repo.getSettings('g-chan');
    expect(s.boostExpiryEnabled).toBe(false);
    expect(s.boostExpiryChannelId).toBeNull();
  });

  test('setInitialMaxPoints enforces minimum and persists', () => {
    expect(() => repo.setInitialMaxPoints('g-max', 5)).toThrow();
    repo.setInitialMaxPoints('g-max', 123);
    const s = repo.getSettings('g-max');
    expect(s.initialMaxPoints).toBe(123);
  });
});
