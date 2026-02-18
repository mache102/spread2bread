import { PlayerRepository } from '../storage/playerRepository';
import { BOOST_DURATION_MS, BOOST_COOLDOWN_MS } from '../utils/constants';

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

    // Check if still on cooldown
    if (player.lastBoostUsed > 0) {
      const timeSinceLastBoost = now - player.lastBoostUsed;
      if (timeSinceLastBoost < BOOST_COOLDOWN_MS) {
        const timeRemaining = BOOST_COOLDOWN_MS - timeSinceLastBoost;
        const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));
        return {
          success: false,
          message: `Your jam boost is recharging! Available in ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}.`,
        };
      }
    }

    // Check if already active
    if (player.boostExpiresAt > now) {
      const timeRemaining = player.boostExpiresAt - now;
      const minutesRemaining = Math.ceil(timeRemaining / (1000 * 60));
      return {
        success: false,
        message: `Your jam boost is already active! ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''} remaining.`,
      };
    }

    // Activate boost
    player.lastBoostUsed = now;
    player.boostExpiresAt = now + BOOST_DURATION_MS;
    this.playerRepo.updatePlayer(player);

    return {
      success: true,
      message: '🔥 Jam boost activated! You\'ll give 3x points to others for 15 minutes!',
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
}
