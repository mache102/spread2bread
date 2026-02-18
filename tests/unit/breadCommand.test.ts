import { describe, test, expect, vi } from 'vitest';
import { data, execute } from '../../src/commands/bread';

describe('/bread command', () => {
  test('command builder includes optional `user` option', () => {
    const json = (data as any).toJSON();
    const hasUserOption = Array.isArray(json.options) && json.options.some((o: any) => o.name === 'user' && o.required === false);
    expect(hasUserOption).toBe(true);
  });

  test('shows other user bread when `user` option provided (does not ping)', async () => {
    const dummyStats = {
      player: { userId: 'target', guildId: 'g1', breadLevel: 3, currentPoints: 123, maxPoints: 300, lastUpgradeAt: 0, lastBoostUsed: 0, boostExpiresAt: 0 },
      aesthetic: 'Test Bread',
      jamLevel: 'Medium',
      jamBar: '===-----',
      canUpgrade: false,
      isBoosted: false,
    } as any;

    const mockGameService = { getPlayerStats: vi.fn().mockReturnValue(dummyStats) } as any;

    const mockInteraction: any = {
      deferReply: vi.fn().mockResolvedValue(undefined),
      editReply: vi.fn().mockResolvedValue(undefined),
      user: { id: 'requester', username: 'Requester' },
      guildId: 'g1',
      options: { getUser: (_: string) => ({ id: 'target', username: 'TargetUser' }) },
    };

    await execute(mockInteraction, mockGameService, true);

    expect(mockGameService.getPlayerStats).toHaveBeenCalledWith('target', 'g1', true);

    const payload = mockInteraction.editReply.mock.calls[0][0];
    expect(payload).toBeDefined();
    const embed = payload.embeds[0];
    expect(embed.data.title).toBe("TargetUser's Bread");
    expect(embed.data.title).not.toContain('<@');
  });

  test('defaults to requester when no `user` option provided', async () => {
    const dummyStats = {
      player: { userId: 'requester', guildId: 'g1', breadLevel: 1, currentPoints: 0, maxPoints: 300, lastUpgradeAt: 0, lastBoostUsed: 0, boostExpiresAt: 0 },
      aesthetic: 'Plain Bread',
      jamLevel: 'Low',
      jamBar: '--------',
      canUpgrade: false,
      isBoosted: false,
    } as any;

    const mockGameService = { getPlayerStats: vi.fn().mockReturnValue(dummyStats) } as any;

    const mockInteraction: any = {
      deferReply: vi.fn().mockResolvedValue(undefined),
      editReply: vi.fn().mockResolvedValue(undefined),
      user: { id: 'requester', username: 'Requester' },
      guildId: 'g1',
      options: { getUser: (_: string) => null },
    };

    await execute(mockInteraction, mockGameService, false);

    expect(mockGameService.getPlayerStats).toHaveBeenCalledWith('requester', 'g1', false);

    const payload = mockInteraction.editReply.mock.calls[0][0];
    const embed = payload.embeds[0];
    expect(embed.data.title).toBe("Requester's Bread");
  });
});
