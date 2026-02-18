import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PlayerRepository } from '../../src/storage/playerRepository';
import { getDatabase, closeDatabase, resetDatabase } from '../../src/storage/database';
import {
  INITIAL_MAX_POINTS,
  INITIAL_BREAD_LEVEL,
  LEVEL_LOSS_PERCENTAGE,
  MAX_POINTS_VARIATION_PERCENTAGE,
} from '../../src/utils/constants';

describe('Point Penalty System', () => {
  let playerRepo: PlayerRepository;
  const userId = 'penalty-user';
  const guildId = 'penalty-guild';

  beforeAll(() => {
    process.env.TEST_MODE = '1';
    process.env.DATABASE_PATH = ':memory:';
    getDatabase();
    playerRepo = new PlayerRepository();
  });

  beforeEach(() => {
    resetDatabase();
  });

  afterAll(() => {
    closeDatabase();
  });

  // ─── no overflow ─────────────────────────────────────────────────────────

  test('no penalty when points stay exactly at maxPoints', () => {
    const result = playerRepo.addPoints(userId, guildId, INITIAL_MAX_POINTS);
    expect(result.penaltyApplied).toBe(false);
    expect(result.newPoints).toBe(INITIAL_MAX_POINTS);
  });

  test('no penalty for partial points below max', () => {
    const result = playerRepo.addPoints(userId, guildId, INITIAL_MAX_POINTS / 2);
    expect(result.penaltyApplied).toBe(false);
  });

  // ─── overflow triggers penalty ────────────────────────────────────────────

  test('penalty triggers when points exceed maxPoints', () => {
    const result = playerRepo.addPoints(userId, guildId, INITIAL_MAX_POINTS + 0.01);
    expect(result.penaltyApplied).toBe(true);
  });

  test('points and maxPoints are returned after overflow', () => {
    const result = playerRepo.addPoints(userId, guildId, INITIAL_MAX_POINTS + 1);
    expect(result.penaltyApplied).toBe(true);
    expect(result.newPoints).toBe(0);
    expect(result.maxPoints).toBeGreaterThan(0);
  });

  test('new maxPoints stays within variation range after penalty', () => {
    const result = playerRepo.addPoints(userId, guildId, INITIAL_MAX_POINTS + 1);
    const low  = Math.floor(INITIAL_MAX_POINTS * (1 - MAX_POINTS_VARIATION_PERCENTAGE));
    const high = Math.floor(INITIAL_MAX_POINTS * (1 + MAX_POINTS_VARIATION_PERCENTAGE));
    expect(result.maxPoints).toBeGreaterThanOrEqual(low);
    expect(result.maxPoints).toBeLessThanOrEqual(high);
  });

  // ─── level loss calculation ───────────────────────────────────────────────

  test('level-1 player loses 1 level (minimum floor)', () => {
    // ceil(1 * 0.1) = 1, minimum = 1  →  still 1
    const result = playerRepo.addPoints(userId, guildId, INITIAL_MAX_POINTS + 1);
    expect(result.levelsLost).toBe(1);
    expect(result.newLevel).toBe(INITIAL_BREAD_LEVEL); // cannot drop below 1
    expect(result.oldLevel).toBe(INITIAL_BREAD_LEVEL);
  });

  test('higher-level player loses ceil(level * LEVEL_LOSS_PERCENTAGE) levels', () => {
    const startLevel = 20;
    const player = playerRepo.getOrCreatePlayer(userId, guildId);
    player.breadLevel = startLevel;
    playerRepo.updatePlayer(player);

    const expected = Math.ceil(startLevel * LEVEL_LOSS_PERCENTAGE);
    const result = playerRepo.addPoints(userId, guildId, INITIAL_MAX_POINTS + 1);

    expect(result.levelsLost).toBe(expected);
    expect(result.oldLevel).toBe(startLevel);
    expect(result.newLevel).toBe(startLevel - expected);
  });

  test('level never drops below 1 even with large loss percentage scenario', () => {
    // Force a situation where ceil(level * pct) >= level
    const player = playerRepo.getOrCreatePlayer(userId, guildId);
    player.breadLevel = 1;
    playerRepo.updatePlayer(player);

    const result = playerRepo.addPoints(userId, guildId, INITIAL_MAX_POINTS + 1);
    expect(result.newLevel).toBeGreaterThanOrEqual(1);
  });

  // ─── database state after penalty ────────────────────────────────────────

  test('persisted player state matches returned penalty values', () => {
    const result = playerRepo.addPoints(userId, guildId, INITIAL_MAX_POINTS + 1);
    const persisted = playerRepo.getOrCreatePlayer(userId, guildId);

    expect(persisted.currentPoints).toBe(result.newPoints);
    expect(persisted.breadLevel).toBe(result.newLevel);
    expect(persisted.maxPoints).toBe(result.maxPoints);
  });
});
