import { UpgradeRange } from '../models';
import { 
  UPGRADE_RANGES, 
  NOT_READY_HOTNESS, 
  RANGE_SPLIT_MIN, 
  RANGE_SPLIT_MAX,
  RANGE_SPLITS 
} from '../utils/constants';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function generateUpgradeRanges(maxPoints: number): UpgradeRange[] {
  const ranges: UpgradeRange[] = [];
  
  // Create normalized ranges by splitting [0, 1]
  const normalizedRanges: { min: number; max: number }[] = [];
  let currentMin = 0;
  let currentMax = 1;
  
  for (let i = 0; i < RANGE_SPLITS; i++) {
    const splitPoint = randomBetween(RANGE_SPLIT_MIN, RANGE_SPLIT_MAX);
    const newMax = lerp(currentMin, currentMax, splitPoint);
    normalizedRanges.push({ min: currentMin, max: newMax });
    currentMin = newMax;
  }
  
  // Add the final range
  normalizedRanges.push({ min: currentMin, max: currentMax });
  
  // Convert normalized ranges to actual point ranges
  // First range (lowest) is always "Not Ready"
  const notReadyRange = normalizedRanges[0];
  ranges.push({
    min: Math.floor(notReadyRange.min * maxPoints),
    max: Math.floor(notReadyRange.max * maxPoints),
    levelBonus: 0,
    hotnessLevel: NOT_READY_HOTNESS,
  });
  
  // Assign remaining ranges to upgrade bonuses (in ascending order)
  for (let i = 1; i < normalizedRanges.length; i++) {
    const range = normalizedRanges[i];
    const upgradeConfig = UPGRADE_RANGES[i - 1] || UPGRADE_RANGES[UPGRADE_RANGES.length - 1];
    
    ranges.push({
      min: Math.floor(range.min * maxPoints),
      max: Math.floor(range.max * maxPoints),
      levelBonus: upgradeConfig.levelBonus,
      hotnessLevel: upgradeConfig.hotnessLevel,
    });
  }
  
  return ranges;
}

export function getCurrentRange(points: number, ranges: UpgradeRange[]): UpgradeRange {
  for (const range of ranges) {
    if (points >= range.min && points <= range.max) {
      return range;
    }
  }
  
  // Fallback to last range if over maxPoints
  return ranges[ranges.length - 1];
}
