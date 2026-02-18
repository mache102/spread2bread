import { PlayerRepository } from '../storage/playerRepository';
import { ChannelRepository } from '../storage/channelRepository';
import { PointTracker } from '../game/pointTracker';
import { getPlayerStats, attemptUpgrade, getAesthetic } from '../game/breadManager';
import { PlayerStats, LeaderboardEntry, PenaltyInfo, PointGain } from '../models';

export class GameService {
  private playerRepo: PlayerRepository;
  private channelRepo: ChannelRepository;
  private pointTracker: PointTracker;

  constructor() {
    this.playerRepo = new PlayerRepository();
    this.channelRepo = new ChannelRepository();
    this.pointTracker = new PointTracker(this.channelRepo, this.playerRepo);
  }

  getPlayerStats(userId: string, guildId: string, includeRanges: boolean = false): PlayerStats {
    const player = this.playerRepo.getOrCreatePlayer(userId, guildId);
    return getPlayerStats(player, includeRanges);
  }

  upgradePlayerBread(userId: string, guildId: string): { 
    success: boolean; 
    levelsGained: number;
    newLevel: number;
    aesthetic: string;
  } {
    const player = this.playerRepo.getOrCreatePlayer(userId, guildId);
    const result = attemptUpgrade(player);
    
    if (result.success) {
      this.playerRepo.updatePlayer(player);
    }
    
    return {
      ...result,
      newLevel: player.breadLevel,
      aesthetic: getAesthetic(player.breadLevel),
    };
  }

  getLeaderboard(guildId: string, limit: number = 10): LeaderboardEntry[] {
    const topPlayers = this.playerRepo.getTopPlayers(guildId, limit);
    return topPlayers.map(player => ({
      userId: player.userId,
      breadLevel: player.breadLevel,
      aesthetic: getAesthetic(player.breadLevel),
    }));
  }

  processMessage(
    messageId: string,
    channelId: string,
    guildId: string,
    userId: string
  ): { penalties: PenaltyInfo[]; gains: PointGain[] } {
    // Check if channel is active
    if (!this.channelRepo.isChannelActive(channelId, guildId)) {
      return { penalties: [], gains: [] };
    }

    const timestamp = Date.now();
    return this.pointTracker.processMessage(messageId, channelId, guildId, userId, timestamp);
  }

  enableChannel(channelId: string, guildId: string): void {
    this.channelRepo.setChannelActive(channelId, guildId, true);
  }

  disableChannel(channelId: string, guildId: string): void {
    this.channelRepo.setChannelActive(channelId, guildId, false);
  }

  getActiveChannels(guildId: string): string[] {
    const channels = this.channelRepo.getActiveChannels(guildId);
    return channels.map(c => c.channelId);
  }

  givePoints(userId: string, guildId: string, amount: number): { newPoints: number; maxPoints: number; penaltyApplied?: boolean; levelsLost?: number; oldLevel?: number; newLevel?: number } {
    // Use the repository addPoints route so penalty logic is applied consistently
    const result = this.playerRepo.addPoints(userId, guildId, amount);
    return {
      newPoints: result.newPoints,
      maxPoints: result.maxPoints,
      penaltyApplied: result.penaltyApplied,
      levelsLost: result.levelsLost,
      oldLevel: result.oldLevel,
      newLevel: result.newLevel,
    };
  }

  giveLevels(userId: string, guildId: string, amount: number): { newLevel: number; aesthetic: string } {
    const player = this.playerRepo.getOrCreatePlayer(userId, guildId);
    player.breadLevel = Math.max(1, player.breadLevel + amount);
    this.playerRepo.updatePlayer(player);
    return { newLevel: player.breadLevel, aesthetic: getAesthetic(player.breadLevel) };
  }
}
