// Set test mode BEFORE any imports to bypass env var requirements
process.env.TEST_MODE = '1';
process.env.DATABASE_PATH = ':memory:';

import { GameService } from '../src/services/gameService';
import { JamBoostService } from '../src/services/jamBoostService';
import { getDatabase, closeDatabase } from '../src/storage/database';

getDatabase();

const gameService = new GameService();
const jamBoostService = new JamBoostService();

const testUserId = 'test-user-123';
const testGuildId = 'test-guild-456';
const testChannelId = 'test-channel-789';

async function testBreadCommand() {
  console.log('\n=== Testing /bread command ===');
  const stats = gameService.getPlayerStats(testUserId, testGuildId);
  console.log('Player stats:', {
    level: stats.player.breadLevel,
    points: `${stats.player.currentPoints}/${stats.player.maxPoints}`,
    aesthetic: stats.aesthetic,
    hotness: stats.hotnessLevel,
    bar: stats.hotnessBar,
  });
}

async function testUpgradeCommand() {
  console.log('\n=== Testing /upgrade command ===');
  const result = gameService.upgradePlayerBread(testUserId, testGuildId);
  console.log('Upgrade result:', {
    success: result.success,
    levelsGained: result.levelsGained,
    newLevel: result.newLevel,
    aesthetic: result.aesthetic,
  });
}

async function testLeaderboardCommand() {
  console.log('\n=== Testing /leaderboard command ===');
  const leaderboard = gameService.getLeaderboard(testGuildId, 10);
  console.log('Leaderboard entries:', leaderboard.length);
  leaderboard.forEach((entry, index) => {
    console.log(`${index + 1}. User ${entry.userId}: Level ${entry.breadLevel} ${entry.aesthetic}`);
  });
}

async function testBoostCommand() {
  console.log('\n=== Testing /boost command ===');
  const result = jamBoostService.activateBoost(testUserId, testGuildId);
  console.log('Boost result:', {
    success: result.success,
    message: result.message,
  });
}

async function testMessageFlow() {
  console.log('\n=== Testing message flow ===');
  
  // Enable channel
  gameService.enableChannel(testChannelId, testGuildId);
  console.log('Channel enabled');
  
  // Simulate user A sending a message
  const userA = 'user-a';
  gameService.processMessage('msg-1', testChannelId, testGuildId, userA);
  console.log('User A sent message');
  
  // Simulate user B sending a message (should give points to user A)
  const userB = 'user-b';
  gameService.processMessage('msg-2', testChannelId, testGuildId, userB);
  console.log('User B sent message');
  
  // Check user A's points
  const statsA = gameService.getPlayerStats(userA, testGuildId);
  console.log(`User A now has ${statsA.player.currentPoints} points`);
  
  // Check user B's points
  const statsB = gameService.getPlayerStats(userB, testGuildId);
  console.log(`User B now has ${statsB.player.currentPoints} points`);
}

async function runTests() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'bread':
        await testBreadCommand();
        break;
      case 'upgrade':
        await testUpgradeCommand();
        break;
      case 'leaderboard':
        await testLeaderboardCommand();
        break;
      case 'boost':
        await testBoostCommand();
        break;
      case 'messages':
        await testMessageFlow();
        break;
      default:
        console.log('Available commands:');
        console.log('  npm run test-cmd bread');
        console.log('  npm run test-cmd upgrade');
        console.log('  npm run test-cmd leaderboard');
        console.log('  npm run test-cmd boost');
        console.log('  npm run test-cmd messages');
        break;
    }
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    closeDatabase();
  }
}

runTests();
