export interface Player {
  userId: string;
  guildId: string;
  breadLevel: number;
  currentPoints: number;
  maxPoints: number;
  lastUpgradeAt: number;
  lastBoostUsed: number;
  boostExpiresAt: number;
}

export interface TrackedMessage {
  messageId: string;
  channelId: string;
  guildId: string;
  userId: string;
  timestamp: number;
  position: number;
}

export interface Channel {
  channelId: string;
  guildId: string;
  isActive: boolean;
}

export interface UpgradeRange {
  min: number;
  max: number;
  levelBonus: number;
  hotnessLevel: string;
}

export interface PlayerStats {
  player: Player;
  aesthetic: string;
  hotnessLevel: string;
  hotnessBar: string;
  canUpgrade: boolean;
  isBoosted: boolean;
  upgradeRanges?: UpgradeRange[];
}

export interface LeaderboardEntry {
  userId: string;
  breadLevel: number;
  aesthetic: string;
}

export interface PenaltyInfo {
  userId: string;
  levelsLost: number;
  oldLevel: number;
  newLevel: number;
}
