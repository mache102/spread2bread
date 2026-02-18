import { TrackedMessage, PenaltyInfo } from '../models';
import { POINT_DISTRIBUTION_WINDOW, BOOST_MULTIPLIER } from '../utils/constants';
import { ChannelRepository } from '../storage/channelRepository';
import { PlayerRepository } from '../storage/playerRepository';

export class PointTracker {
  private channelRepo: ChannelRepository;
  private playerRepo: PlayerRepository;

  constructor(channelRepo: ChannelRepository, playerRepo: PlayerRepository) {
    this.channelRepo = channelRepo;
    this.playerRepo = playerRepo;
  }

  processMessage(
    messageId: string,
    channelId: string,
    guildId: string,
    userId: string,
    timestamp: number
  ): PenaltyInfo[] {
    // Get recent messages before this one
    const recentMessages = this.channelRepo.getRecentMessages(channelId, POINT_DISTRIBUTION_WINDOW);
    
    // Distribute points to previous message senders and collect penalties
    const penalties = this.distributePoints(recentMessages, guildId, userId);
    
    // Add this message to tracking
    const newMessage: TrackedMessage = {
      messageId,
      channelId,
      guildId,
      userId,
      timestamp,
      position: 0,
    };
    
    this.channelRepo.addTrackedMessage(newMessage);
    
    return penalties;
  }

  private distributePoints(messages: TrackedMessage[], guildId: string, currentUserId: string): PenaltyInfo[] {
    const now = Date.now();
    const penalties: PenaltyInfo[] = [];
    
    for (const message of messages) {
      // Don't give points to yourself
      if (message.userId === currentUserId) {
        continue;
      }
      
      // Calculate base points: position 0 = N/N points, position 1 = (N-1)/N points, etc.
      const basePoints = (POINT_DISTRIBUTION_WINDOW - message.position) / POINT_DISTRIBUTION_WINDOW;
      
      // Check if the message sender has an active boost
      const sender = this.playerRepo.getOrCreatePlayer(message.userId, guildId);
      const isBoostActive = sender.boostExpiresAt > now;
      
      // Apply boost multiplier if active
      const points = isBoostActive ? basePoints * BOOST_MULTIPLIER : basePoints;
      
      // Award points and check for penalty
      const result = this.playerRepo.addPoints(message.userId, guildId, points);
      
      if (result.penaltyApplied) {
        // Use returned old/new level if available
        penalties.push({
          userId: message.userId,
          levelsLost: result.levelsLost,
          oldLevel: result.oldLevel ?? (this.playerRepo.getOrCreatePlayer(message.userId, guildId).breadLevel + result.levelsLost),
          newLevel: result.newLevel ?? this.playerRepo.getOrCreatePlayer(message.userId, guildId).breadLevel,
        });
      }
    }
    
    return penalties;
  }
}
