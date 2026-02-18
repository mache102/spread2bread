import { TrackedMessage, PenaltyInfo } from '../models';
import { TRACK_MESSAGE_COUNT, BOOST_MULTIPLIER } from '../utils/constants';
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
    const recentMessages = this.channelRepo.getRecentMessages(channelId, TRACK_MESSAGE_COUNT);
    
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
      const basePoints = (TRACK_MESSAGE_COUNT - message.position) / TRACK_MESSAGE_COUNT;
      
      // Check if the message sender has an active boost
      const sender = this.playerRepo.getOrCreatePlayer(message.userId, guildId);
      const isBoostActive = sender.boostExpiresAt > now;
      
      // Apply boost multiplier if active
      const points = isBoostActive ? basePoints * BOOST_MULTIPLIER : basePoints;
      
      // Award points and check for penalty
      const result = this.playerRepo.addPoints(message.userId, guildId, points);
      
      if (result.penaltyApplied) {
        // Get updated player to get new level
        const updatedPlayer = this.playerRepo.getOrCreatePlayer(message.userId, guildId);
        penalties.push({
          userId: message.userId,
          levelsLost: result.levelsLost,
          oldLevel: updatedPlayer.breadLevel + result.levelsLost,
          newLevel: updatedPlayer.breadLevel,
        });
      }
    }
    
    return penalties;
  }
}
