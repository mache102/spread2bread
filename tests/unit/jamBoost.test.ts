import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { JamBoostService } from '../../src/services/jamBoostService';
import { PlayerRepository } from '../../src/storage/playerRepository';
import { getDatabase, closeDatabase, resetDatabase } from '../../src/storage/database';
import { BOOST_DURATION_MS, BOOST_COOLDOWN_MS, BOOST_MULTIPLIER, MS_PER_MINUTE } from '../../src/utils/constants';

describe('Jam Boost Service', () => {
  let boostService: JamBoostService;
  let playerRepo: PlayerRepository;
  const userId = 'boost-user';
  const guildId = 'boost-guild';

  beforeAll(() => {
    process.env.TEST_MODE = '1';
    process.env.DATABASE_PATH = ':memory:';
    getDatabase();
    boostService = new JamBoostService();
    playerRepo = new PlayerRepository();
  });

  beforeEach(() => {
    resetDatabase();
  });

  afterAll(() => {
    closeDatabase();
  });

  // ─── activation ──────────────────────────────────────────────────────────

  test('successfully activates boost on first use', () => {
    const result = boostService.activateBoost(userId, guildId);
    expect(result.success).toBe(true);
    expect(result.expiresAt).toBeDefined();
    expect(result.expiresAt!).toBeGreaterThan(Date.now());
  });

  test('expiresAt is approximately now + BOOST_DURATION_MS', () => {
    const before = Date.now();
    const result = boostService.activateBoost(userId, guildId);
    const expected = before + BOOST_DURATION_MS;
    // allow 200ms tolerance for execution time
    expect(result.expiresAt!).toBeGreaterThanOrEqual(expected - 200);
    expect(result.expiresAt!).toBeLessThanOrEqual(expected + 200);
  });

  test('activation message references BOOST_MULTIPLIER', () => {
    const result = boostService.activateBoost(userId, guildId);
    expect(result.message).toContain(`${BOOST_MULTIPLIER}x`);
  });

  test('activation message references boost duration in minutes', () => {
    const minutes = BOOST_DURATION_MS / MS_PER_MINUTE;
    const result = boostService.activateBoost(userId, guildId);
    expect(result.message).toContain(`${minutes}`);
  });

  // ─── isBoostActive ───────────────────────────────────────────────────────

  test('isBoostActive is true immediately after activation', () => {
    boostService.activateBoost(userId, guildId);
    expect(boostService.isBoostActive(userId, guildId)).toBe(true);
  });

  test('isBoostActive is false for a fresh player', () => {
    expect(boostService.isBoostActive(userId, guildId)).toBe(false);
  });

  // ─── already-active rejection ────────────────────────────────────────────

  test('rejects second activation while boost is still active', () => {
    boostService.activateBoost(userId, guildId);
    const second = boostService.activateBoost(userId, guildId);
    expect(second.success).toBe(false);
    expect(second.message).toContain('already active');
  });

  // ─── cooldown rejection ──────────────────────────────────────────────────

  test('rejects activation when cooldown has not expired', () => {
    // Simulate a used boost that has already expired (no active boost, but lastBoostUsed is recent)
    const player = playerRepo.getOrCreatePlayer(userId, guildId);
    player.lastBoostUsed = Date.now();
    player.boostExpiresAt = 0;
    playerRepo.updatePlayer(player);

    const result = boostService.activateBoost(userId, guildId);
    expect(result.success).toBe(false);
    expect(result.message).toContain('recharging');
  });

  test('cooldown message contains hours remaining', () => {
    const player = playerRepo.getOrCreatePlayer(userId, guildId);
    player.lastBoostUsed = Date.now();
    player.boostExpiresAt = 0;
    playerRepo.updatePlayer(player);

    const result = boostService.activateBoost(userId, guildId);
    expect(result.message).toMatch(/\d+ hour/);
  });

  // ─── getBoostStatus ──────────────────────────────────────────────────────

  test('getBoostStatus reports active with timeRemaining when boost is on', () => {
    boostService.activateBoost(userId, guildId);
    const status = boostService.getBoostStatus(userId, guildId);
    expect(status.isActive).toBe(true);
    expect(status.timeRemaining).toBeDefined();
    expect(status.timeRemaining!).toBeGreaterThan(0);
  });

  test('getBoostStatus reports inactive with cooldownRemaining when on cooldown', () => {
    const player = playerRepo.getOrCreatePlayer(userId, guildId);
    player.lastBoostUsed = Date.now();
    player.boostExpiresAt = 0;
    playerRepo.updatePlayer(player);

    const status = boostService.getBoostStatus(userId, guildId);
    expect(status.isActive).toBe(false);
    expect(status.cooldownRemaining).toBeDefined();
    expect(status.cooldownRemaining!).toBeGreaterThan(0);
    expect(status.cooldownRemaining!).toBeLessThanOrEqual(BOOST_COOLDOWN_MS);
  });

  test('getBoostStatus reports inactive with no cooldown for fresh player', () => {
    const status = boostService.getBoostStatus(userId, guildId);
    expect(status.isActive).toBe(false);
    expect(status.cooldownRemaining).toBeUndefined();
  });
});
