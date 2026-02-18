import { Player, PlayerStats } from '../models';
import { generateUpgradeRanges, getCurrentRange } from './rangeGenerator';
import { 
  AESTHETIC_MILESTONES, 
  BAR_LENGTH, 
  BAR_FILLED, 
  BAR_EMPTY,
  INITIAL_MAX_POINTS,
  LEVEL_LOSS_PERCENTAGE 
} from '../utils/constants';

export function getAesthetic(level: number): string {
  for (let i = AESTHETIC_MILESTONES.length - 1; i >= 0; i--) {
    if (level >= AESTHETIC_MILESTONES[i].level) {
      return AESTHETIC_MILESTONES[i].name;
    }
  }
  return AESTHETIC_MILESTONES[0].name;
}

export function getPlayerStats(player: Player, includeRanges: boolean = false): PlayerStats {
  const ranges = generateUpgradeRanges(player.maxPoints);
  const currentRange = getCurrentRange(player.currentPoints, ranges);
  
  const aesthetic = getAesthetic(player.breadLevel);
  const hotnessLevel = currentRange.hotnessLevel;
  const canUpgrade = currentRange.levelBonus > 0;
  
  // Calculate hotness bar
  const progress = player.currentPoints / player.maxPoints;
  const filledBars = Math.floor(progress * BAR_LENGTH);
  const hotnessBar = BAR_FILLED.repeat(filledBars) + BAR_EMPTY.repeat(BAR_LENGTH - filledBars);
  
  // Check if boost is active
  const now = Date.now();
  const isBoosted = player.boostExpiresAt > now;
  
  return {
    player,
    aesthetic,
    hotnessLevel,
    hotnessBar,
    canUpgrade,
    isBoosted,
    upgradeRanges: includeRanges ? ranges : undefined,
  };
}

export function attemptUpgrade(player: Player): { success: boolean; levelsGained: number } {
  const ranges = generateUpgradeRanges(player.maxPoints);
  const currentRange = getCurrentRange(player.currentPoints, ranges);
  
  if (currentRange.levelBonus === 0) {
    return { success: false, levelsGained: 0 };
  }
  
  // Check if over maxPoints
  if (player.currentPoints > player.maxPoints) {
    // Penalty: lose 10% of levels
    const levelsLost = Math.floor(player.breadLevel * LEVEL_LOSS_PERCENTAGE);
    player.breadLevel = Math.max(1, player.breadLevel - levelsLost);
    player.currentPoints = 0;
    player.lastUpgradeAt = Date.now();
    return { success: false, levelsGained: -levelsLost };
  }
  
  // Successful upgrade
  player.breadLevel += currentRange.levelBonus;
  player.currentPoints = 0;
  player.lastUpgradeAt = Date.now();
  
  return { success: true, levelsGained: currentRange.levelBonus };
}

export function resetPointMeter(player: Player): void {
  player.currentPoints = 0;
  // Randomize maxPoints: 300 +/- 20% (240 to 360)
  const variation = INITIAL_MAX_POINTS * 0.2;
  player.maxPoints = Math.floor(
    INITIAL_MAX_POINTS - variation + Math.random() * (variation * 2)
  );
  player.lastUpgradeAt = Date.now();
}
