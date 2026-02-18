import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { getDatabase, resetDatabase, closeDatabase } from '../../src/storage/database';
import { GuildRepository } from '../../src/storage/guildRepository';
import { PlayerRepository } from '../../src/storage/playerRepository';

describe('PlayerRepository with guild initialMaxPoints', () => {
  beforeAll(() => {
    process.env.DATABASE_PATH = ':memory:';
    getDatabase();
    resetDatabase();
  });

  afterAll(() => {
    resetDatabase();
    closeDatabase();
  });

  test('new players use guild initialMaxPoints', () => {
    const guildRepo = new GuildRepository();
    const playerRepo = new PlayerRepository();

    guildRepo.setInitialMaxPoints('g1', 424);

    const p = playerRepo.getOrCreatePlayer('user1', 'g1');
    expect(p.maxPoints).toBe(424);
  });
});
