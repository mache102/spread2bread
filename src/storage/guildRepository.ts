import { getDatabase } from './database';

export interface GuildSettings {
  guildId: string;
  initialMaxPoints: number;
  boostExpiryChannelId?: string | null;
  boostExpiryEnabled: boolean;
}

export class GuildRepository {
  getSettings(guildId: string): GuildSettings {
    const db = getDatabase();
    const row = db.prepare(`SELECT * FROM guild_settings WHERE guildId = ?`).get(guildId) as any;

    if (row) {
      return {
        guildId: row.guildId,
        initialMaxPoints: row.initialMaxPoints,
        boostExpiryChannelId: row.boostExpiryChannelId || null,
        boostExpiryEnabled: !!row.boostExpiryEnabled,
      };
    }

    // Defaults
    return {
      guildId,
      initialMaxPoints: 300,
      boostExpiryChannelId: null,
      boostExpiryEnabled: false,
    };
  }

  setInitialMaxPoints(guildId: string, amount: number): void {
    if (amount < 10) throw new Error('initialMaxPoints must be at least 10');
    withDatabaseRetry(db => db.prepare(`
      INSERT INTO guild_settings (guildId, initialMaxPoints)
      VALUES (?, ?)
      ON CONFLICT(guildId) DO UPDATE SET initialMaxPoints = ?
    `).run(guildId, amount, amount));
  }

  setBoostExpiryChannel(guildId: string, channelId: string): void {
    withDatabaseRetry(db => db.prepare(`
      INSERT INTO guild_settings (guildId, boostExpiryChannelId, boostExpiryEnabled)
      VALUES (?, ?, 1)
      ON CONFLICT(guildId) DO UPDATE SET boostExpiryChannelId = ?, boostExpiryEnabled = 1
    `).run(guildId, channelId, channelId));
  }

  disableBoostExpiryNotifications(guildId: string): void {
    withDatabaseRetry(db => db.prepare(`
      INSERT INTO guild_settings (guildId, boostExpiryEnabled, boostExpiryChannelId)
      VALUES (?, 0, NULL)
      ON CONFLICT(guildId) DO UPDATE SET boostExpiryEnabled = 0, boostExpiryChannelId = NULL
    `).run(guildId));
  }

  isBoostExpiryEnabled(guildId: string): boolean {
    return this.getSettings(guildId).boostExpiryEnabled;
  }

  getBoostExpiryChannelId(guildId: string): string | null | undefined {
    return this.getSettings(guildId).boostExpiryChannelId || null;
  }

  getInitialMaxPoints(guildId: string): number {
    return this.getSettings(guildId).initialMaxPoints;
  }
}
