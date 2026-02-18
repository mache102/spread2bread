import { getDatabase } from './database';
import { Channel, TrackedMessage } from '../models';
import { POINT_DISTRIBUTION_WINDOW } from '../utils/constants';

export class ChannelRepository {
  isChannelActive(channelId: string, guildId: string): boolean {
    const db = getDatabase();
    const channel = db.prepare(`
      SELECT isActive FROM channels WHERE channelId = ? AND guildId = ?
    `).get(channelId, guildId) as { isActive: number } | undefined;

    // Default to disabled; admins must explicitly enable channels via /admin enable
    return channel ? channel.isActive === 1 : false;
  }

  setChannelActive(channelId: string, guildId: string, isActive: boolean): void {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO channels (channelId, guildId, isActive)
      VALUES (?, ?, ?)
      ON CONFLICT(channelId, guildId) DO UPDATE SET isActive = ?
    `).run(channelId, guildId, isActive ? 1 : 0, isActive ? 1 : 0);
  }

  getActiveChannels(guildId: string): Channel[] {
    const db = getDatabase();
    return db.prepare(`
      SELECT channelId, guildId, isActive FROM channels 
      WHERE guildId = ? AND isActive = 1
    `).all(guildId) as Channel[];
  }

  addTrackedMessage(message: TrackedMessage): void {
    const db = getDatabase();

    // Increment position of existing messages in this channel
    db.prepare(`
      UPDATE tracked_messages 
      SET position = position + 1 
      WHERE channelId = ?
    `).run(message.channelId);

    // Insert the new message at position 0
    db.prepare(`
      INSERT INTO tracked_messages (messageId, channelId, guildId, userId, timestamp, position)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(message.messageId, message.channelId, message.guildId, message.userId, message.timestamp);

    // Delete messages beyond POINT_DISTRIBUTION_WINDOW
    db.prepare(`
      DELETE FROM tracked_messages 
      WHERE channelId = ? AND position >= ?
    `).run(message.channelId, POINT_DISTRIBUTION_WINDOW);
  }

  getRecentMessages(channelId: string, limit: number = POINT_DISTRIBUTION_WINDOW): TrackedMessage[] {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM tracked_messages 
      WHERE channelId = ? 
      ORDER BY position ASC
      LIMIT ?
    `).all(channelId, limit) as TrackedMessage[];
  }

  clearOldMessages(channelId: string): void {
    const db = getDatabase();
    db.prepare(`
      DELETE FROM tracked_messages 
      WHERE channelId = ? AND position >= ?
    `).run(channelId, POINT_DISTRIBUTION_WINDOW);
  }
}
