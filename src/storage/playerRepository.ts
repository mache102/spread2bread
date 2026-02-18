import { getDatabase } from './database';
import { Player } from '../models';
import { INITIAL_BREAD_LEVEL, INITIAL_MAX_POINTS } from '../utils/constants';

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

  addPoints(userId: string, guildId: string, points: number): void {
    const db = getDatabase();
    db.prepare(`
      UPDATE players 
      SET currentPoints = MIN(currentPoints + ?, maxPoints)
      WHERE userId = ? AND guildId = ?
    `).run(points, userId, guildId);
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
