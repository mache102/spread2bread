import { describe, test, expect } from 'vitest';
import { getAesthetic, getPlayerStats, attemptUpgrade } from '../../src/game/breadManager';
import { Player } from '../../src/models';
import {
  INITIAL_MAX_POINTS,
  INITIAL_BREAD_LEVEL,
  BAR_LENGTH,
  AESTHETIC_MILESTONES,
} from '../../src/utils/constants';

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    userId: 'u1',
    guildId: 'g1',
    breadLevel: INITIAL_BREAD_LEVEL,
    currentPoints: 0,
    maxPoints: INITIAL_MAX_POINTS,
    lastUpgradeAt: 0,
    lastBoostUsed: 0,
    boostExpiresAt: 0,
    ...overrides,
  };
}

// ─── getAesthetic ────────────────────────────────────────────────────────────

describe('getAesthetic', () => {
  test('returns Plain Bread below first milestone', () => {
    expect(getAesthetic(0)).toContain('Plain Bread');
    expect(getAesthetic(4)).toContain('Plain Bread');
  });

  test('returns correct aesthetic exactly at each milestone level', () => {
    for (const { level, name } of AESTHETIC_MILESTONES) {
      expect(getAesthetic(level)).toBe(name);
    }
  });

  test('returns previous milestone aesthetic just below the next one', () => {
    // Level 9 should still be Whole Wheat (milestone at 5), not Croissant (milestone at 10)
    expect(getAesthetic(9)).toContain('Whole Wheat');
    expect(getAesthetic(24)).toContain('Croissant');
  });

  test('returns highest aesthetic at and beyond max milestone', () => {
    const maxMilestone = AESTHETIC_MILESTONES[AESTHETIC_MILESTONES.length - 1];
    expect(getAesthetic(maxMilestone.level)).toBe(maxMilestone.name);
    expect(getAesthetic(maxMilestone.level + 9999)).toBe(maxMilestone.name);
  });
});

// ─── getPlayerStats ──────────────────────────────────────────────────────────

describe('getPlayerStats', () => {
  test('returns all expected fields', () => {
    const player = makePlayer();
    const stats = getPlayerStats(player);
    expect(stats.player).toBe(player);
    expect(typeof stats.aesthetic).toBe('string');
    expect(typeof stats.jamLevel).toBe('string');
    expect(typeof stats.jamBar).toBe('string');
    expect(typeof stats.canUpgrade).toBe('boolean');
    expect(typeof stats.isBoosted).toBe('boolean');
  });

  test('jam bar has length equal to BAR_LENGTH', () => {
    const stats = getPlayerStats(makePlayer());
    expect(stats.jamBar).toHaveLength(BAR_LENGTH);
  });

  test('canUpgrade is false when at 0 points', () => {
    expect(getPlayerStats(makePlayer({ currentPoints: 0 })).canUpgrade).toBe(false);
  });

  test('canUpgrade is true when in an upgrade range (at maxPoints)', () => {
    // maxPoints is always within the last (PERFECT) range
    const stats = getPlayerStats(makePlayer({ currentPoints: INITIAL_MAX_POINTS }));
    expect(stats.canUpgrade).toBe(true);
  });

  test('isBoosted is false when boostExpiresAt is in the past', () => {
    const stats = getPlayerStats(makePlayer({ boostExpiresAt: Date.now() - 1000 }));
    expect(stats.isBoosted).toBe(false);
  });

  test('isBoosted is true when boostExpiresAt is in the future', () => {
    const stats = getPlayerStats(makePlayer({ boostExpiresAt: Date.now() + 60_000 }));
    expect(stats.isBoosted).toBe(true);
  });

  test('upgradeRanges is undefined when includeRanges is false', () => {
    expect(getPlayerStats(makePlayer(), false).upgradeRanges).toBeUndefined();
  });

  test('upgradeRanges is populated when includeRanges is true', () => {
    const ranges = getPlayerStats(makePlayer(), true).upgradeRanges;
    expect(ranges).toBeDefined();
    expect(ranges!.length).toBeGreaterThan(0);
  });
});

// ─── attemptUpgrade ──────────────────────────────────────────────────────────

describe('attemptUpgrade', () => {
  test('fails when player has 0 points', () => {
    const player = makePlayer({ currentPoints: 0 });
    const result = attemptUpgrade(player);
    expect(result.success).toBe(false);
    expect(result.levelsGained).toBe(0);
    // Player levels unchanged
    expect(player.breadLevel).toBe(INITIAL_BREAD_LEVEL);
  });

  test('succeeds when points are at maxPoints (last/PERFECT range)', () => {
    const player = makePlayer({ currentPoints: INITIAL_MAX_POINTS });
    const result = attemptUpgrade(player);
    expect(result.success).toBe(true);
    expect(result.levelsGained).toBeGreaterThan(0);
  });

  test('resets currentPoints to 0 on success', () => {
    const player = makePlayer({ currentPoints: INITIAL_MAX_POINTS });
    attemptUpgrade(player);
    expect(player.currentPoints).toBe(0);
  });

  test('increments breadLevel by levelsGained on success', () => {
    const player = makePlayer({ currentPoints: INITIAL_MAX_POINTS });
    const before = player.breadLevel;
    const { levelsGained } = attemptUpgrade(player);
    expect(player.breadLevel).toBe(before + levelsGained);
  });

  test('updates lastUpgradeAt on success', () => {
    const player = makePlayer({ currentPoints: INITIAL_MAX_POINTS, lastUpgradeAt: 0 });
    const before = Date.now();
    attemptUpgrade(player);
    expect(player.lastUpgradeAt).toBeGreaterThanOrEqual(before);
  });
});
