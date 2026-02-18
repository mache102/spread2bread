import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { GameService } from '../../src/services/gameService';
import { getDatabase, closeDatabase, resetDatabase } from '../../src/storage/database';
import { INITIAL_BREAD_LEVEL, INITIAL_MAX_POINTS } from '../../src/utils/constants';

describe('Game Integration Tests', () => {
  let gameService: GameService;
  const testUserId = 'test-user-123';
  const testGuildId = 'test-guild-456';
  const testChannelId = 'test-channel-789';

  beforeAll(() => {
    process.env.TEST_MODE = '1';
    process.env.DATABASE_PATH = ':memory:';
    getDatabase();
    gameService = new GameService();
  });

  beforeEach(() => {
    // Reset database before each test to avoid UNIQUE constraint errors
    resetDatabase();
  });

  afterAll(() => {
    closeDatabase();
  });

  test('should create new player with initial stats', () => {
    const stats = gameService.getPlayerStats(testUserId, testGuildId);
    
    expect(stats.player.breadLevel).toBe(INITIAL_BREAD_LEVEL);
    expect(stats.player.currentPoints).toBe(0);
    expect(stats.player.maxPoints).toBe(INITIAL_MAX_POINTS);
    expect(stats.aesthetic).toContain('Plain Bread');
  });

  test('should not allow upgrade without sufficient points', () => {
    const result = gameService.upgradePlayerBread(testUserId, testGuildId);
    
    expect(result.success).toBe(false);
    expect(result.levelsGained).toBe(0);
  });

  test('should track messages and award points', () => {
    gameService.enableChannel(testChannelId, testGuildId);
    
    const userA = 'user-a';
    const userB = 'user-b';
    
    // User A sends message
    gameService.processMessage('msg-1', testChannelId, testGuildId, userA);
    
    // User B sends message (awards points to A)
    gameService.processMessage('msg-2', testChannelId, testGuildId, userB);
    
    const statsA = gameService.getPlayerStats(userA, testGuildId);
    expect(statsA.player.currentPoints).toBeGreaterThan(0);
    
    const statsB = gameService.getPlayerStats(userB, testGuildId);
    expect(statsB.player.currentPoints).toBe(0);
  });

  test('should return leaderboard sorted by level', () => {
    // Create some players with different levels
    gameService.giveLevels('user-1', testGuildId, 10);
    gameService.giveLevels('user-2', testGuildId, 5);
    gameService.giveLevels('user-3', testGuildId, 15);
    
    const leaderboard = gameService.getLeaderboard(testGuildId);
    
    expect(Array.isArray(leaderboard)).toBe(true);
    expect(leaderboard.length).toBeGreaterThan(0);
    
    // Check if sorted by level (descending)
    for (let i = 1; i < leaderboard.length; i++) {
      expect(leaderboard[i - 1].breadLevel).toBeGreaterThanOrEqual(leaderboard[i].breadLevel);
    }
    
    // Verify top player is user-3 with 15 levels
    expect(leaderboard[0].userId).toBe('user-3');
    expect(leaderboard[0].breadLevel).toBe(INITIAL_BREAD_LEVEL + 15); // 1 base + 15 given
  });

  test('should enable and disable channels', () => {
    const channelId = 'new-channel-123';
    
    gameService.enableChannel(channelId, testGuildId);
    let activeChannels = gameService.getActiveChannels(testGuildId);
    expect(activeChannels).toContain(channelId);
    
    gameService.disableChannel(channelId, testGuildId);
    activeChannels = gameService.getActiveChannels(testGuildId);
    expect(activeChannels).not.toContain(channelId);
  });
});
