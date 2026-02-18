import { PlayerRepository } from '../storage/playerRepository';
import { Player } from '../models';
import { BOOST_DURATION_MS, BOOST_COOLDOWN_MS, BOOST_MULTIPLIER, MS_PER_MINUTE, MS_PER_HOUR } from '../utils/constants';

export class JamBoostService {
  private playerRepo: PlayerRepository;

  constructor() {
    this.playerRepo = new PlayerRepository();
  }

  activateBoost(userId: string, guildId: string): { 
    success: boolean; 
    message: string;
    expiresAt?: number;
  } {
    const player = this.playerRepo.getOrCreatePlayer(userId, guildId);
    const now = Date.now();

    // Check if already active first
    if (player.boostExpiresAt > now) {
      const timeRemaining = player.boostExpiresAt - now;
      const minutesRemaining = Math.ceil(timeRemaining / MS_PER_MINUTE);
      return {
        success: false,
        message: `Your jam boost is already active! ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''} remaining.`,
      };
    }

    // Check if still on cooldown
    if (player.lastBoostUsed > 0) {
      const timeSinceLastBoost = now - player.lastBoostUsed;
      if (timeSinceLastBoost < BOOST_COOLDOWN_MS) {
        const timeRemaining = BOOST_COOLDOWN_MS - timeSinceLastBoost;
        const hoursRemaining = Math.ceil(timeRemaining / MS_PER_HOUR);
        return {
          success: false,
          message: `Your jam boost is recharging! Available in ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}.`,
        };
      }
    }

    // Activate boost
    player.lastBoostUsed = now;
    player.boostExpiresAt = now + BOOST_DURATION_MS;
    this.playerRepo.updatePlayer(player);

    return {
      success: true,
      message: `🔥 Jam boost activated! You'll give ${BOOST_MULTIPLIER}x points to others for ${BOOST_DURATION_MS / MS_PER_MINUTE} minutes!`,
      expiresAt: player.boostExpiresAt,
    };
  }

  isBoostActive(userId: string, guildId: string): boolean {
    const player = this.playerRepo.getOrCreatePlayer(userId, guildId);
    return player.boostExpiresAt > Date.now();
  }

  getBoostStatus(userId: string, guildId: string): {
    isActive: boolean;
    timeRemaining?: number;
    cooldownRemaining?: number;
  } {
    const player = this.playerRepo.getOrCreatePlayer(userId, guildId);
    const now = Date.now();

    const isActive = player.boostExpiresAt > now;
    
    if (isActive) {
      return {
        isActive: true,
        timeRemaining: player.boostExpiresAt - now,
      };
    }

    if (player.lastBoostUsed > 0) {
      const timeSinceLastBoost = now - player.lastBoostUsed;
      if (timeSinceLastBoost < BOOST_COOLDOWN_MS) {
        return {
          isActive: false,
          cooldownRemaining: BOOST_COOLDOWN_MS - timeSinceLastBoost,
        };
      }
    }

    return { isActive: false };
  }

  // Returns players whose boosts have expired but still have a positive boostExpiresAt (notify once)
  getExpiredBoostPlayers(): Player[] {
    const now = Date.now();
    return this.playerRepo.getPlayersWithExpiredBoosts(now);
  }

  // Clear boostExpiresAt after notifying (prevents duplicate notifications)
  clearBoostExpiration(userId: string, guildId: string): void {
    const player = this.playerRepo.getOrCreatePlayer(userId, guildId);
    player.boostExpiresAt = 0;
    this.playerRepo.updatePlayer(player);
  }
}
