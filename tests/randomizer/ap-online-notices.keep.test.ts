/* @layer tests @kind test */
/**
 * The online session's notices, read at the seam the play area's toast stack listens to
 * (online-notices.ts), with the online client against an in-process server and a recording
 * core: each PrintJSON kind, the connection's changes and a DeathLink death raise the right
 * kind with the exact line. Then the toast queue (notice-burst.ts): a kind the settings turn off
 * queues nothing, and a burst folds into one counted summary.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createOnlineClient } from '@app/lib/game/randomizer-client/online-client';
import { onOnlineNotice } from '@app/lib/game/randomizer-client/online-notices';
import { BURST_LIMIT, BURST_WINDOW_MS, queueNotice } from '@app/lib/game/randomizer-client/notice-burst';
import { ONLINE_NOTICE_DEFAULTS } from '@shared/randomizer/archipelago/online-notice-settings';
import { createFakeServer } from './ap-fake-server';
import { createFakeCore } from './ap-fake-core';
import type { FakeRoom } from './ap-fake-server';
import type { ApServerPacket } from '@app/lib/game/randomizer-client/ap-protocol.type';
import type { OnlineNotice } from '@app/lib/game/randomizer-client/online-notices';
import type { NoticeEntry } from '@app/lib/game/randomizer-client/notice-burst';

vi.mock('@app/lib/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});

const OWN = 'Relic of the Past';
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

const settle = async (): Promise<void> => {
  for (let i = 0; i < 60; i += 1) await Promise.resolve();
};

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

beforeEach(() => {
  vi.useFakeTimers();
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

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

describe('the toast queue', () => {
  const received = (from: string): OnlineNotice => ({
    kind: 'itemReceived', text: `Received Bow from ${from}`, counterpart: from,
    parts: [{ text: 'Received ' }, { text: 'Bow', tone: 'item' }, { text: ' from ' }, { text: from, tone: 'player' }],
  });
  const run = (notices: readonly OnlineNotice[], settings = ONLINE_NOTICE_DEFAULTS, step = 0): readonly NoticeEntry[] => {
    let serial = 0;
    return notices.reduce<readonly NoticeEntry[]>(
      (entries, notice, index) => queueNotice(entries, notice, settings, index * step, () => `n${serial++}`), [],
    );
  };

  it('a kind turned off queues nothing; the defaults leave the room\'s other finds off', () => {
    expect(run([received('Drizztdourden_')], { ...ONLINE_NOTICE_DEFAULTS, apNotifyItemReceived: false })).toEqual([]);
    const other: OnlineNotice = { kind: 'otherCheck', text: 'x', parts: [{ text: 'x' }] };
    expect(run([other])).toEqual([]);
    expect(run([other], { ...ONLINE_NOTICE_DEFAULTS, apNotifyOtherCheck: true })).toHaveLength(1);
  });

  it(`up to ${BURST_LIMIT} show as they are; more fold into one counted line`, () => {
    expect(run(Array(BURST_LIMIT).fill(received('Drizztdourden_'))).map((entry) => entry.notice.text))
      .toEqual(Array(BURST_LIMIT).fill('Received Bow from Drizztdourden_'));
    const burst = run(Array(136).fill(received('Drizztdourden_')));
    expect(burst).toHaveLength(1);
    expect(burst[0].count).toBe(136);
    expect(burst[0].notice.text).toBe('136 items received from Drizztdourden_');
    expect(burst[0].notice.parts.at(-1)).toEqual({ text: 'Drizztdourden_', tone: 'player' });
  });

  it('a burst forming never pushes out the lines before it', () => {
    const line = (kind: OnlineNotice['kind'], text: string): OnlineNotice => ({ kind, text, parts: [{ text }] });
    const before = [line('goal', 'goal'), line('release', 'release'), line('itemSent', 's'), line('connection', 'c')];
    const queue = run([...before, ...Array(40).fill(received('Drizztdourden_'))]);
    expect(queue.map((entry) => entry.notice.text)).toEqual(['goal', 'release', 's', 'c', '40 items received from Drizztdourden_']);
    expect(run(Array(9).fill(line('chat', 'hi')), ONLINE_NOTICE_DEFAULTS, BURST_WINDOW_MS + 1)).toHaveLength(0);
    expect(run(Array(9).fill(line('chat', 'hi')), { ...ONLINE_NOTICE_DEFAULTS, apNotifyChat: true }, BURST_WINDOW_MS + 1)).toHaveLength(5);
  });

  it('notices further apart than the window, or from another player, are no burst', () => {
    expect(run(Array(5).fill(received('Drizztdourden_')), ONLINE_NOTICE_DEFAULTS, BURST_WINDOW_MS + 1)).toHaveLength(5);
    const mixed = run([...Array(3).fill(received('Drizztdourden_')), ...Array(2).fill(received('Zelda'))]);
    expect(mixed.map((entry) => entry.count)).toEqual([1, 1, 1, 1, 1]);
  });
});
