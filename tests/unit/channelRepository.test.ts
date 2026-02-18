import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { getDatabase, resetDatabase, closeDatabase } from '../../src/storage/database';
import { ChannelRepository } from '../../src/storage/channelRepository';

describe('ChannelRepository defaults', () => {
  let repo: ChannelRepository;

  beforeAll(() => {
    process.env.DATABASE_PATH = ':memory:';
    getDatabase();
    repo = new ChannelRepository();
  });

  afterAll(() => {
    resetDatabase();
    closeDatabase();
  });

  test('isChannelActive returns false by default for unknown channel', () => {
    const active = repo.isChannelActive('unknown-channel', 'g1');
    expect(active).toBe(false);
  });

  test('setChannelActive can disable and enable a channel', () => {
    repo.setChannelActive('ch-1', 'g1', false);
    expect(repo.isChannelActive('ch-1', 'g1')).toBe(false);

    repo.setChannelActive('ch-1', 'g1', true);
    expect(repo.isChannelActive('ch-1', 'g1')).toBe(true);
  });
});
