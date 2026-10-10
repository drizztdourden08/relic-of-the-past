/* @layer tests @kind test */
import { describe, expect, it, vi } from 'vitest';
import { createOnlineClient } from '@app/game/randomizer-client/online-client';
import { onOnlineNotice } from '@rotp/randomizer';
import type { ApServerPacket, OnlineNotice } from '@rotp/randomizer';
import { createFakeServer } from '../ap-fake-server';
import type { FakeRoom } from '../ap-fake-server';
import { createFakeCore } from '../ap-fake-core';
import { OWN, installClientHarness, settle } from '../ap-protocol-harness';

vi.mock('@app/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});

const OTHER = 'Ship of Harkinian';

const room = (password?: string): FakeRoom => ({
  ...(password === undefined ? {} : { password }),
  games: {
    [OWN]: { item_name_to_id: { Bow: 100 }, location_name_to_id: { 'Link\'s House': 1 }, checksum: 'own-1' },
    [OTHER]: { item_name_to_id: { 'Kokiri Sword': 500 }, location_name_to_id: { 'Mido Chest': 900 }, checksum: 'other-1' },
  },
  items: [],
  checked: [],
  missing: [1],
  players: [
    { team: 0, slot: 1, alias: 'Link', name: 'Link' },
    { team: 0, slot: 2, alias: 'Drizztdourden_', name: 'Drizztdourden_' },
    { team: 0, slot: 3, alias: 'Zelda', name: 'Zelda' },
  ],
  slotInfo: {
    1: { name: 'Link', game: OWN, type: 1, group_members: [] },
    2: { name: 'Drizztdourden_', game: OTHER, type: 1, group_members: [] },
    3: { name: 'Zelda', game: OTHER, type: 1, group_members: [] },
  },
  slotData: {
    worldVersion: '0.1.0', options: { goal: 'ganon' }, medallions: { mire: 'Ether', turtleRock: 'Quake' },
    preRolled: { shopPrices: [10] }, deathLink: true,
  },
  placements: { 1: { item: 100, location: 1, player: 1, flags: 0 } },
  refusedUrls: new Set(),
});

const itemSend = (receiving: number, finder: number, item: number, location: number): ApServerPacket => ({
  cmd: 'PrintJSON', type: 'ItemSend', receiving, item: { item, location, player: finder, flags: 0 }, data: [{ text: 'x' }],
});

const boot = async (password?: string) => {
  const server = createFakeServer(room(password));
  const core = createFakeCore();
  const notices: OnlineNotice[] = [];
  const unsubscribe = onOnlineNotice((notice) => { notices.push(notice); });
  const session = createOnlineClient(
    { url: 'localhost:38281', slotName: 'Link', deathLink: true }, { core, createSocket: server.createSocket },
  );
  await session.start();
  await settle();
  const push = async (packets: ApServerPacket[]): Promise<OnlineNotice[]> => {
    notices.length = 0;
    server.push(packets);
    await settle();
    return [...notices];
  };
  return { server, core, notices, push, stop: () => { unsubscribe(); session.stop(); } };
};

const lines = (notices: readonly OnlineNotice[]): string[] => notices.map(({ kind, text }) => `${kind}: ${text}`);

installClientHarness();

describe('notices from the session', () => {
  it('items: received, sent, our own, and passed between two other players', async () => {
    const { push, stop } = await boot();
    const got = await push([
      itemSend(1, 2, 100, 900), itemSend(2, 1, 500, 1), itemSend(1, 1, 100, 1),
      itemSend(3, 2, 500, 900), itemSend(2, 2, 500, 900),
    ]);
    expect(lines(got)).toEqual([
      'itemReceived: Received Bow from Drizztdourden_',
      'itemSent: Kokiri Sword sent to Drizztdourden_',
      'ownCheck: You found your Bow',
      'otherCheck: Drizztdourden_ sent Kokiri Sword to Zelda',
      'otherCheck: Drizztdourden_ found their Kokiri Sword',
    ]);
    expect(got[0].parts).toEqual([
      { text: 'Received ' }, { text: 'Bow', tone: 'item' }, { text: ' from ' }, { text: 'Drizztdourden_', tone: 'player' },
    ]);
    expect(got[0].counterpart).toBe('Drizztdourden_');
    stop();
  });

  it('hints keep the server line with the names drawn apart, ours apart from the rest', async () => {
    const { push, stop } = await boot();
    const hint = (receiving: number, finder: number, item: number): ApServerPacket => ({
      cmd: 'PrintJSON', type: 'Hint', receiving, found: false, item: { item, location: 900, player: finder, flags: 0 },
      data: [
        { text: '[Hint]: ' }, { type: 'player_id', text: String(receiving) }, { text: "'s " },
        { type: 'item_id', text: String(item), player: receiving }, { text: ' is at ' },
        { type: 'location_id', text: '900', player: finder }, { text: '.' },
      ],
    });
    const got = await push([hint(1, 2, 100), hint(3, 2, 500)]);
    expect(lines(got)).toEqual([
      "hintOwn: [Hint]: Link's Bow is at Mido Chest.",
      "hintOther: [Hint]: Zelda's Kokiri Sword is at Mido Chest.",
    ]);
    expect(got[1].parts.filter((part) => part.tone)).toEqual([
      { text: 'Zelda', tone: 'player' }, { text: 'Kokiri Sword', tone: 'item' },
    ]);
    stop();
  });

  it('joins, goals, release and collect, and chat; trackers and our own lines say nothing', async () => {
    const { push, stop } = await boot();
    const print = (type: string, slot: number, extra: Partial<ApServerPacket> = {}): ApServerPacket =>
      ({ cmd: 'PrintJSON', type, slot, team: 0, data: [{ text: `${type} line` }], ...extra }) as ApServerPacket;
    const got = await push([
      print('Join', 2, { tags: ['AP'] } as Partial<ApServerPacket>),
      print('Join', 3, { tags: ['Tracker'] } as Partial<ApServerPacket>),
      print('Join', 1, { tags: ['AP'] } as Partial<ApServerPacket>),
      print('Part', 2),
      print('Goal', 2), print('Goal', 1), print('Release', 3), print('Collect', 2),
      print('Chat', 2, { message: 'hi' } as Partial<ApServerPacket>),
      print('Chat', 1, { message: 'mine' } as Partial<ApServerPacket>),
      { cmd: 'PrintJSON', type: 'ServerChat', message: 'restarting soon', data: [{ text: 'restarting soon' }] },
      print('Goal', 2, { team: 1 } as Partial<ApServerPacket>),
    ]);
    expect(lines(got)).toEqual([
      'join: Drizztdourden_ joined, playing Ship of Harkinian',
      'join: Drizztdourden_ left',
      'goal: Drizztdourden_ completed their goal',
      'goal: You completed your goal',
      'release: Zelda released their remaining items',
      'release: Drizztdourden_ collected their remaining items',
      'chat: Drizztdourden_: hi',
      'chat: Server: restarting soon',
    ]);
    stop();
  });

  it('the connection: accepted, lost, accepted again', async () => {
    const { server, notices, stop } = await boot();
    expect(lines(notices)).toEqual(['connection: Connected to the room as Link']);
    notices.length = 0;
    server.drop();
    await settle();
    await vi.advanceTimersByTimeAsync(1000);
    await settle();
    expect(lines(notices)).toEqual(['connection: Connection lost, reconnecting', 'connection: Reconnected to the room']);
    stop();
  });

  it('a refused connection says why', async () => {
    const { notices, stop } = await boot('secret');
    expect(lines(notices)).toEqual(['connection: Wrong room password.']);
    stop();
  });

  it('a DeathLink death joins the same notices', async () => {
    const { push, stop } = await boot();
    const got = await push([{ cmd: 'Bounced', tags: ['DeathLink'], data: { source: 'Drizztdourden_', time: 0, cause: '' } }]);
    expect(lines(got)).toEqual(['deathLink: Drizztdourden_ died, and took you along.']);
    stop();
  });
});
