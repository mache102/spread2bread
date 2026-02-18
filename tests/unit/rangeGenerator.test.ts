import { describe, test, expect } from 'vitest';
import { generateUpgradeRanges, getCurrentRange } from '../../src/game/rangeGenerator';
import { UPGRADE_RANGES, NOT_READY_JAM, INITIAL_MAX_POINTS } from '../../src/utils/constants';

// ─── generateUpgradeRanges ───────────────────────────────────────────────────

describe('generateUpgradeRanges', () => {
  const TRIALS = 20; // run random generation multiple times to catch edge cases

  test('returns 1 Not Ready range + one range per upgrade tier', () => {
    const ranges = generateUpgradeRanges(INITIAL_MAX_POINTS);
    expect(ranges).toHaveLength(UPGRADE_RANGES.length + 1);
  });

  test('first range is always Not Ready with 0 level bonus', () => {
    for (let i = 0; i < TRIALS; i++) {
      const ranges = generateUpgradeRanges(INITIAL_MAX_POINTS);
      expect(ranges[0].jamLevel).toBe(NOT_READY_JAM);
      expect(ranges[0].levelBonus).toBe(0);
    }
  });

  test('last range always ends exactly at maxPoints', () => {
    for (let i = 0; i < TRIALS; i++) {
      const ranges = generateUpgradeRanges(INITIAL_MAX_POINTS);
      expect(ranges[ranges.length - 1].max).toBe(INITIAL_MAX_POINTS);
    }
  });

  test('every range has at least 1 unit width', () => {
    for (let i = 0; i < TRIALS; i++) {
      const ranges = generateUpgradeRanges(INITIAL_MAX_POINTS);
      for (const range of ranges) {
        expect(range.max - range.min).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('ranges are ordered and non-overlapping (next.min > prev.max)', () => {
    for (let i = 0; i < TRIALS; i++) {
      const ranges = generateUpgradeRanges(INITIAL_MAX_POINTS);
      for (let j = 1; j < ranges.length; j++) {
        expect(ranges[j].min).toBeGreaterThan(ranges[j - 1].max);
      }
    }
  });

  test('upgrade tiers are ordered by ascending level bonus', () => {
    const ranges = generateUpgradeRanges(INITIAL_MAX_POINTS);
    const upgradeTiers = ranges.filter(r => r.levelBonus > 0);
    expect(upgradeTiers).toHaveLength(UPGRADE_RANGES.length);
    for (let i = 1; i < upgradeTiers.length; i++) {
      expect(upgradeTiers[i].levelBonus).toBeGreaterThan(upgradeTiers[i - 1].levelBonus);
    }
  });

  test('works with a non-default maxPoints value', () => {
    const MAX = 260;
    const ranges = generateUpgradeRanges(MAX);
    expect(ranges[ranges.length - 1].max).toBe(MAX);
    for (const r of ranges) {
      expect(r.max - r.min).toBeGreaterThanOrEqual(1);
    }
  });
});

// ─── getCurrentRange ─────────────────────────────────────────────────────────

describe('getCurrentRange', () => {
  const ranges = [
    { min: 0,   max: 100, levelBonus: 0,  jamLevel: NOT_READY_JAM },
    { min: 101, max: 200, levelBonus: 1,  jamLevel: 'Light' },
    { min: 201, max: 300, levelBonus: 50, jamLevel: 'PERFECT' },
  ];

  test('returns correct range for exact boundary values', () => {
    expect(getCurrentRange(0,   ranges).levelBonus).toBe(0);
    expect(getCurrentRange(100, ranges).levelBonus).toBe(0);
    expect(getCurrentRange(101, ranges).levelBonus).toBe(1);
    expect(getCurrentRange(200, ranges).levelBonus).toBe(1);
    expect(getCurrentRange(201, ranges).levelBonus).toBe(50);
    expect(getCurrentRange(300, ranges).levelBonus).toBe(50);
  });

  test('falls back to last range when points exceed maxPoints', () => {
    expect(getCurrentRange(9999, ranges).levelBonus).toBe(50);
  });
});
