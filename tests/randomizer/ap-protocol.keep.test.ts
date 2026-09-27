/* @layer tests @kind test */
/**
 * The multiworld client against an in-process server (ap-fake-server.ts) and a recording
 * core (ap-fake-core.ts), in node: the handshake, slot data, the received index across a
 * reconnect, the gap Sync, the own-pickup echo, server items, offline checks, the goal, the
 * reconnect backoff, rendered messages, DeathLink both ways with the slot data deciding over
 * the profile flag, and the refusal of a slot from another world package version.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createOnlineClient } from '@app/lib/game/randomizer-client/online-client';
import { createFakeServer, VERSION } from './ap-fake-server';
import { createFakeCore } from './ap-fake-core';
import { parseSlotData } from '@shared/randomizer/archipelago/parse-slot-data';
import { AP_WORLD_VERSION } from '@shared/randomizer/archipelago/ap-game';
import type { FakeRoom, FakeServer } from './ap-fake-server';
import type { OnlineSessionConfig } from '@app/lib/game/randomizer-client/online-session-config.type';

// The real bus installs window error handlers on import; node has no window.
vi.mock('@app/lib/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});

const OWN = 'Relic of the Past';

const makeRoom = (overrides: Partial<FakeRoom> = {}): FakeRoom => ({
  games: {
    [OWN]: {
      item_name_to_id: { Bow: 100, Hookshot: 101, Lamp: 102, Boots: 103 },
      location_name_to_id: { 'check-001': 1, 'check-002': 2, 'check-003': 3 },
      checksum: 'own-1',
    },
    Other: { item_name_to_id: { 'Other Sword': 500 }, location_name_to_id: { 'Other Place': 900 }, checksum: 'other-1' },
  },
  items: [],
  checked: [],
  missing: [1, 2, 3],
  players: [{ team: 0, slot: 1, alias: 'Link', name: 'Link' }, { team: 0, slot: 2, alias: 'Zelda', name: 'Zelda' }],
  slotInfo: {
    1: { name: 'Link', game: OWN, type: 1, group_members: [] },
    2: { name: 'Zelda', game: 'Other', type: 1, group_members: [] },
  },
  slotData: {
    worldVersion: '0.1.0', options: { goal: 'ganon' }, medallions: { mire: 'Ether', turtleRock: 'Quake' },
    preRolled: { shopPrices: [10] }, deathLink: false,
  },
  placements: {
    1: { item: 101, location: 1, player: 1, flags: 0 },
    2: { item: 500, location: 2, player: 2, flags: 0 },
    3: { item: 102, location: 3, player: 1, flags: 0 },
  },
  refusedUrls: new Set(),
  ...overrides,
});

const item = (id: number, player: number, location: number) => ({ item: id, player, location, flags: 0 });

const settle = async (): Promise<void> => {
  for (let i = 0; i < 60; i += 1) await Promise.resolve();
};

const boot = async (room: FakeRoom, extra: Partial<OnlineSessionConfig> = {}) => {
  const server = createFakeServer(room);
  const core = createFakeCore();
  const session = createOnlineClient(
    { url: 'localhost:38281', slotName: 'Link', password: room.password, ...extra },
    { core, createSocket: server.createSocket },
  );
  await session.start();
  await settle();
  return { server, core, session };
};

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
  vi.restoreAllMocks();
});

describe('handshake', () => {
  it('connects with password, uuid, the server version and DeathLink; wss falls back to ws', async () => {
    const room = makeRoom({ password: 'pw', refusedUrls: new Set(['wss://localhost:38281']) });
    const { server, session } = await boot(room, { deathLink: true });
    expect(server.urls).toEqual(['wss://localhost:38281', 'ws://localhost:38281']);
    expect(server.of('GetDataPackage')[0].games.sort()).toEqual(['Other', OWN].sort());
    const [connect] = server.of('Connect');
    expect(connect).toMatchObject({
      game: OWN, name: 'Link', password: 'pw', version: VERSION, items_handling: 0b111, tags: ['DeathLink'], slot_data: true,
    });
    expect(connect.uuid).toBe(localStorage.getItem('rotp.ap.uuid'));
    expect(session.status).toBe('active');
  });

  it('stores slot data and the room, and reuses the cached data package', async () => {
    const { session } = await boot(makeRoom());
    expect(session.slotData).toEqual({
      worldVersion: '0.1.0', options: { goal: 'ganon' }, medallions: { mire: 'Ether', turtleRock: 'Quake' },
      preRolled: { shopPrices: [10] }, deathLink: false,
    });
    expect([session.team, session.slot, session.players.length]).toEqual([0, 1, 2]);
    expect([...session.missingLocations]).toEqual([1, 2, 3]);
    const again = await boot(makeRoom());
    expect(again.server.of('GetDataPackage')).toHaveLength(0);
    expect(again.server.of('Connect')).toHaveLength(1);
  });

  it('a wrong password ends in error with nothing left armed', async () => {
    const { session, core } = await boot(makeRoom({ password: 'pw' }), { password: 'nope' });
    expect(session.status).toBe('error');
    expect(core.disarms).toBeGreaterThan(0);
  });
});

describe('received items', () => {
  it('never delivers an item twice across a reconnect that replays the whole list', async () => {
    const room = makeRoom({ items: [item(100, 2, 900), item(101, 2, 900)] });
    const { server, core, session } = await boot(room);
    expect(core.delivered.map((d) => d.itemName)).toEqual(['Bow', 'Hookshot']);
    expect(core.index).toBe(2);
    server.drop();
    await settle();
    expect(session.status).toBe('reconnecting');
    room.items.push(item(102, 2, 900));
    await vi.advanceTimersByTimeAsync(1000);
    await settle();
    expect(session.status).toBe('active');
    expect(core.delivered.map((d) => d.itemName)).toEqual(['Bow', 'Hookshot', 'Lamp']);
    expect(core.index).toBe(3);
  });

  it('a gap asks for Sync and resumes from the saved index', async () => {
    const room = makeRoom({ items: [item(100, 2, 900), item(101, 2, 900)] });
    const { server, core } = await boot(room);
    room.items.push(item(102, 2, 900), item(103, 2, 900));
    server.push([{ cmd: 'ReceivedItems', index: 3, items: [item(103, 2, 900)] }]);
    await settle();
    expect(server.of('Sync')).toHaveLength(1);
    expect(core.delivered.map((d) => d.itemName)).toEqual(['Bow', 'Hookshot', 'Lamp', 'Boots']);
    expect(core.index).toBe(4);
  });

  it('skips an own pickup echo only when the sender is this slot, and delivers server items', async () => {
    const room = makeRoom({ items: [item(100, 1, 1), item(103, 2, 1), item(102, 0, -1)] });
    const server = createFakeServer(room);
    const core = createFakeCore();
    core.armedLocations.add(1);
    const session = createOnlineClient({ url: 'ws://host:1', slotName: 'Link' }, { core, createSocket: server.createSocket });
    await session.start();
    await settle();
    expect(core.delivered).toEqual([{ itemName: 'Boots', sender: 'Zelda' }, { itemName: 'Lamp', sender: null }]);
    expect(core.index).toBe(3);
    expect(session.senderNameOf(item(102, 0, -1))).toBe('Server');
  });
});

describe('checks and goal', () => {
  it('reports offline checks the server lacks, and the goal once', async () => {
    const room = makeRoom({ checked: [2], missing: [1, 3] });
    const server = createFakeServer(room);
    const core = createFakeCore();
    core.localComplete = new Set(['check-001', 'check-002', 'check-351']);
    const session = createOnlineClient({ url: 'ws://host:1', slotName: 'Link' }, { core, createSocket: server.createSocket });
    await session.start();
    await settle();
    expect(server.of('LocationChecks').flatMap((p) => p.locations)).toEqual([1]);
    core.reporter?.reportCheck('check-351');
    expect(server.of('StatusUpdate')).toEqual([{ cmd: 'StatusUpdate', status: 30 }]);
  });
});

describe('reconnect', () => {
  it('backs off 1s, 2s, 4s while the server stays away', async () => {
    const room = makeRoom();
    const { server, session } = await boot(room, { url: 'ws://host:1' });
    room.refusedUrls.add('ws://host:1');
    server.drop();
    await settle();
    const dials = (): number => server.urls.length;
    const before = dials();
    await vi.advanceTimersByTimeAsync(999);
    expect(dials()).toBe(before);
    await vi.advanceTimersByTimeAsync(1);
    await settle();
    expect(dials()).toBe(before + 1);
    await vi.advanceTimersByTimeAsync(2000);
    await settle();
    expect(dials()).toBe(before + 2);
    await vi.advanceTimersByTimeAsync(3999);
    expect(dials()).toBe(before + 2);
    room.refusedUrls.clear();
    await vi.advanceTimersByTimeAsync(1);
    await settle();
    expect(session.status).toBe('active');
  });
});

describe('messages', () => {
  it('renders PrintJSON with names from every game in the room', async () => {
    const { server, session } = await boot(makeRoom());
    const seen: string[] = [];
    session.onMessages((messages) => seen.push(messages[messages.length - 1].text));
    server.push([{
      cmd: 'PrintJSON', type: 'ItemSend',
      data: [
        { type: 'player_id', text: '2' }, { text: ' sent ' }, { type: 'item_id', text: '100', player: 1 },
        { text: ' to ' }, { type: 'player_id', text: '1' }, { text: ' (' },
        { type: 'location_id', text: '900', player: 2 }, { text: ')' },
      ],
    }]);
    await settle();
    expect(seen).toEqual(['Zelda sent Bow to Link (Other Place)']);
    expect(session.messages[0]).toMatchObject({ kind: 'item', text: 'Zelda sent Bow to Link (Other Place)' });
  });
});

const withDeathLink = (deathLink: boolean): FakeRoom => {
  const room = makeRoom();
  room.slotData = { ...(room.slotData as Record<string, unknown>), deathLink };
  return room;
};

/** The DeathLink bounces only: the network ping is a Bounce too. */
const deathLinkBounces = (server: FakeServer) => server.of('Bounce').filter((packet) => packet.tags?.includes('DeathLink'));

describe('DeathLink', () => {
  it('kills on a room death, sends our own, and guards both ways for 5 s', async () => {
    const { server, core } = await boot(withDeathLink(true), { deathLink: true });
    const bounce = (source: string) => server.push([{ cmd: 'Bounced', tags: ['DeathLink'], data: { source, time: 0, cause: `${source} fell` } }]);
    bounce('Zelda');
    await settle();
    expect(core.kills).toBe(1);
    core.die('killed by the room');
    expect(deathLinkBounces(server)).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(6000);
    core.die('fell in a pit');
    expect(deathLinkBounces(server)).toEqual([{
      cmd: 'Bounce', tags: ['DeathLink'], data: { time: Date.now() / 1000, source: 'Link', cause: 'fell in a pit' },
    }]);
    bounce('Link');
    bounce('Zelda');
    await settle();
    expect(core.kills).toBe(1);
    await vi.advanceTimersByTimeAsync(6000);
    bounce('Zelda');
    await settle();
    expect(core.kills).toBe(2);
    expect([server.of('ConnectUpdate'), core.deathLinkBits]).toEqual([[], [true]]);
  });

  it('a death the room caused (core cause 1) is never sent, however late it commits', async () => {
    const { server, core } = await boot(withDeathLink(true), { deathLink: true });
    server.push([{ cmd: 'Bounced', tags: ['DeathLink'], data: { source: 'Zelda', time: 0, cause: 'fell' } }]);
    await settle();
    expect(core.kills).toBe(1);
    await vi.advanceTimersByTimeAsync(6000);
    core.die(1);
    expect(deathLinkBounces(server)).toHaveLength(0);
  });

  it('a genuine death after a room kill a fairy undid (core cause 0) is sent', async () => {
    const { server, core } = await boot(withDeathLink(true), { deathLink: true });
    server.push([{ cmd: 'Bounced', tags: ['DeathLink'], data: { source: 'Zelda', time: 0, cause: 'fell' } }]);
    await settle();
    expect(core.kills).toBe(1);
    // The fairy revived Link, so the core reported nothing and cleared its room-kill flag.
    await vi.advanceTimersByTimeAsync(6000);
    core.die(0);
    expect(deathLinkBounces(server)).toEqual([{
      cmd: 'Bounce', tags: ['DeathLink'], data: { time: Date.now() / 1000, source: 'Link', cause: 'Link died' },
    }]);
  });

  it('the slot data decides once Connected, and a ConnectUpdate corrects the tags', async () => {
    const off = await boot(withDeathLink(false), { deathLink: true });
    expect(off.server.of('Connect')[0].tags).toEqual(['DeathLink']);
    expect(off.server.of('ConnectUpdate')).toEqual([{ cmd: 'ConnectUpdate', items_handling: 0b111, tags: [] }]);
    expect(off.core.deathLinkBits).toEqual([true, false]);
    off.server.push([{ cmd: 'Bounced', tags: ['DeathLink'], data: { source: 'Zelda', time: 0, cause: 'fell' } }]);
    await settle();
    off.core.die('fell in a pit');
    expect([off.core.kills, deathLinkBounces(off.server).length]).toEqual([0, 0]);

    const on = await boot(withDeathLink(true));
    expect(on.server.of('Connect')[0].tags).toEqual([]);
    expect(on.server.of('ConnectUpdate')).toEqual([{ cmd: 'ConnectUpdate', items_handling: 0b111, tags: ['DeathLink'] }]);
    on.server.push([{ cmd: 'Bounced', tags: ['DeathLink'], data: { source: 'Zelda', time: 0, cause: 'fell' } }]);
    await settle();
    expect(on.core.kills).toBe(1);
  });
});

describe('the world package version', () => {
  it('a slot generated by another package version ends the session and says why', async () => {
    const room = makeRoom();
    room.slotData = { ...(room.slotData as Record<string, unknown>), worldVersion: '0.0.9' };
    const { session, core, server } = await boot(room);
    expect(session.status).toBe('error');
    expect(core.disarms).toBeGreaterThan(0);
    expect(server.of('LocationScouts')).toHaveLength(0);
    expect(parseSlotData(room.slotData)).toEqual({
      kind: 'version',
      message: `World package version 0.0.9 does not match this app (${AP_WORLD_VERSION}). `
        + 'Regenerate the game with the package this app saves.',
    });
  });
});
