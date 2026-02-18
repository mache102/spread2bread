import { getDatabase } from './database';
import { Player } from '../models';
import { INITIAL_BREAD_LEVEL, INITIAL_MAX_POINTS, MAX_POINTS_VARIATION_PERCENTAGE } from '../utils/constants';

export class PlayerRepository {
  getOrCreatePlayer(userId: string, guildId: string): Player {
    const db = getDatabase();
    
    let player = db.prepare(`
      SELECT * FROM players WHERE userId = ? AND guildId = ?
    `).get(userId, guildId) as Player | undefined;

    if (!player) {
      db.prepare(`
        INSERT INTO players (userId, guildId, breadLevel, currentPoints, maxPoints, lastUpgradeAt, lastBoostUsed, boostExpiresAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, guildId, INITIAL_BREAD_LEVEL, 0, INITIAL_MAX_POINTS, 0, 0, 0);

      player = db.prepare(`
        SELECT * FROM players WHERE userId = ? AND guildId = ?
      `).get(userId, guildId) as Player;
    }

    return player;
  }

  updatePlayer(player: Player): void {
    const db = getDatabase();
    db.prepare(`
      UPDATE players 
      SET breadLevel = ?, currentPoints = ?, maxPoints = ?, lastUpgradeAt = ?, lastBoostUsed = ?, boostExpiresAt = ?
      WHERE userId = ? AND guildId = ?
    `).run(
      player.breadLevel,
      player.currentPoints,
      player.maxPoints,
      player.lastUpgradeAt,
      player.lastBoostUsed,
      player.boostExpiresAt,
      player.userId,
      player.guildId
    );
  }

  addPoints(userId: string, guildId: string, points: number): { penaltyApplied: boolean; levelsLost: number } {
    // Get player first to check for penalty
    const player = this.getOrCreatePlayer(userId, guildId);
    
    // Add points without capping
    player.currentPoints += points;
    
    // Check if penalty should be applied
    if (player.currentPoints > player.maxPoints) {
      // Penalty: lose 10% of levels (rounded up), minimum 1 level
      const levelsLost = Math.max(1, Math.ceil(player.breadLevel * 0.1));
      const oldLevel = player.breadLevel;
      player.breadLevel = Math.max(1, player.breadLevel - levelsLost);
      
      // Reset point meter with randomized maxPoints
      player.currentPoints = 0;
      const variation = INITIAL_MAX_POINTS * MAX_POINTS_VARIATION_PERCENTAGE;
      player.maxPoints = Math.floor(
        INITIAL_MAX_POINTS - variation + Math.random() * (variation * 2)
      );
      player.lastUpgradeAt = Date.now();
      
      this.updatePlayer(player);
      
      return { penaltyApplied: true, levelsLost };
    }
    
    // Update player without penalty
    this.updatePlayer(player);
    return { penaltyApplied: false, levelsLost: 0 };
  }

  getTopPlayers(guildId: string, limit: number = 10): Player[] {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM players 
      WHERE guildId = ? 
      ORDER BY breadLevel DESC, currentPoints DESC 
      LIMIT ?
    `).all(guildId, limit) as Player[];
  }
}
