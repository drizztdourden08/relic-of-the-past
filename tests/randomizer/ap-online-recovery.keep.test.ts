/* @layer tests @kind test */
/**
 * The online client's recovery paths against the fake server and the recording core: the
 * received list asked for again once the game can take items, the scout arm that finishes
 * after a stop, a refused scout, and the offline baseline that reports an armed pickup made
 * while no client was connected. Then the save file: nothing is delivered while no file is in
 * play, the index moves only on a grant, every save swap asks for the list again and the
 * re-read index filters it, a save bound to another room takes nothing, and the room's own
 * checked locations are marked collected.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createOnlineClient } from '@app/lib/game/randomizer-client/online-client';
import { rebaselineEntries } from '@app/lib/game/randomizer-client/poll-rebaseline';
import { baselineEntriesOf } from '@app/lib/game/randomizer-client/baseline-entries';
import { roomHashOf } from '@app/lib/game/randomizer-client/room-hash';
import { ROOM_MISMATCH } from '@app/lib/game/randomizer-client/online-room-identity';
import { createFakeServer } from './ap-fake-server';
import { createFakeCore } from './ap-fake-core';
import type { FakeRoom } from './ap-fake-server';
import type { FakeCore } from './ap-fake-core';
import type { CreateSocket } from '@app/lib/game/randomizer-client/ap-socket.type';
import type { PhysicalPlan } from '@app/lib/game/randomizer-client/physical-plan.type';

const logged = vi.hoisted(() => [] as string[]);

vi.mock('@app/lib/log-bus', () => {
  const quiet = (): void => undefined;
  const randomizer = (message: string): void => { logged.push(message); };
  return { log: { core: quiet, app: quiet, randomizer, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});

const OWN = 'Relic of the Past';

const makeRoom = (overrides: Partial<FakeRoom> = {}): FakeRoom => ({
  games: {
    [OWN]: { item_name_to_id: { Bow: 100, Hookshot: 101 }, location_name_to_id: { 'check-001': 1 }, checksum: 'own-1' },
  },
  items: [],
  checked: [],
  missing: [1],
  players: [{ team: 0, slot: 1, alias: 'Link', name: 'Link' }, { team: 0, slot: 2, alias: 'Zelda', name: 'Zelda' }],
  slotInfo: { 1: { name: 'Link', game: OWN, type: 1, group_members: [] } },
  slotData: { worldVersion: '0.1.0', options: {}, medallions: { mire: 'Ether', turtleRock: 'Quake' }, deathLink: false },
  placements: { 1: { item: 101, location: 1, player: 1, flags: 0 } },
  refusedUrls: new Set(),
  ...overrides,
});

const item = (id: number, player: number, location: number) => ({ item: id, player, location, flags: 0 });

const settle = async (): Promise<void> => {
  for (let i = 0; i < 60; i += 1) await Promise.resolve();
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
});

describe('online recovery', () => {
  it('asks for the list again once the game can take items, and resumes where it stopped', async () => {
    const room = makeRoom({ items: [item(100, 2, 900), item(101, 2, 900)] });
    const server = createFakeServer(room);
    const core = createFakeCore();
    core.notReady.add('Hookshot');
    const session = createOnlineClient({ url: 'ws://host:1', slotName: 'Link' }, { core, createSocket: server.createSocket });
    await session.start();
    await settle();
    expect(core.delivered.map((d) => d.itemName)).toEqual(['Bow']);
    expect([core.index, server.of('Sync').length]).toEqual([1, 0]);
    core.becomeReady();
    await settle();
    expect(server.of('Sync')).toHaveLength(1);
    expect(core.delivered.map((d) => d.itemName)).toEqual(['Bow', 'Hookshot']);
    expect(core.index).toBe(2);
  });

  it('a scout arm that finishes after a stop disarms again', async () => {
    const server = createFakeServer(makeRoom());
    const core = createFakeCore();
    let finishArm: () => void = () => undefined;
    core.armScouted = () => new Promise((resolve) => {
      finishArm = () => resolve({ ok: true, placement: null, pollEntries: null });
    });
    const session = createOnlineClient({ url: 'ws://host:1', slotName: 'Link' }, { core, createSocket: server.createSocket });
    await session.start();
    await settle();
    session.stop();
    await settle();
    const disarmsAtStop = core.disarms;
    finishArm();
    await settle();
    expect(core.disarms).toBe(disarmsAtStop + 1);
  });

  it('asks for the scouts again when a drop lost the answer, then delivers', async () => {
    const server = createFakeServer(makeRoom({ items: [item(100, 2, 900)] }));
    let swallowScout = true;
    const createSocket: CreateSocket = (url) => {
      const socket = server.createSocket(url);
      const send = socket.send;
      socket.send = (data) => {
        if (swallowScout && data.includes('"LocationScouts"')) {
          swallowScout = false;
          server.drop();
          return;
        }
        send(data);
      };
      return socket;
    };
    const core = createFakeCore();
    const session = createOnlineClient({ url: 'ws://host:1', slotName: 'Link' }, { core, createSocket });
    await session.start();
    await settle();
    expect(core.delivered).toEqual([]);
    await vi.advanceTimersByTimeAsync(1000);
    await settle();
    expect(server.of('LocationScouts')).toHaveLength(1);
    expect(core.delivered.map((d) => d.itemName)).toEqual(['Bow']);
    expect(session.status).toBe('active');
  });

  it('a refused scout ends the session, since nothing could arm', async () => {
    const server = createFakeServer(makeRoom());
    const core = createFakeCore();
    const session = createOnlineClient({ url: 'ws://host:1', slotName: 'Link' }, { core, createSocket: server.createSocket });
    await session.start();
    server.push([{ cmd: 'InvalidPacket', type: 'arguments', original_cmd: 'LocationScouts', text: 'no' }]);
    await settle();
    expect(session.status).toBe('error');
  });
});

describe('the offline baseline', () => {
  const plan = {
    entries: [
      { location: 'check-019', item: 'item-bow', checkId: 'check-019', planClass: 'override-npc' },
      { location: 'check-001', item: 'item-bow', checkId: 'check-001', planClass: 'deliver' },
    ],
    errors: [],
  } as unknown as PhysicalPlan;
  const completed = new Set(['check-019']);
  const input = {
    entries: baselineEntriesOf(plan),
    suppressed: new Set<string>(),
    isComplete: (entry: { checkId?: string }) => entry.checkId !== undefined && completed.has(entry.checkId),
  };

  it('reports an armed pickup the save shows and the server lacks', () => {
    expect(baselineEntriesOf(plan).map((entry) => entry.key)).toEqual(['check-019']);
    expect(rebaselineEntries({ ...input, isKnownReported: () => false }).toReport).toEqual(['check-019']);
    expect(rebaselineEntries({ ...input, isKnownReported: () => true }).toReport).toEqual([]);
  });

  it('a local session adopts it silently', () => {
    expect(rebaselineEntries(input).toReport).toEqual([]);
  });
});

const bootWith = async (room: FakeRoom, prepare: (core: FakeCore) => void = () => undefined) => {
  const server = createFakeServer(room);
  const core = createFakeCore();
  prepare(core);
  const session = createOnlineClient({ url: 'ws://host:1', slotName: 'Link' }, { core, createSocket: server.createSocket });
  await session.start();
  await settle();
  return { server, core, session };
};

const names = (core: FakeCore): string[] => core.delivered.map((d) => d.itemName);

describe('received items and the save file', () => {
  const five = () => [100, 101, 100, 101, 100].map((id) => item(id, 2, 900));

  it('delivers nothing and keeps the index while no file is in play, then asks once one is', async () => {
    const { server, core } = await bootWith(makeRoom({ items: five().slice(0, 2) }), (c) => { c.inPlay = false; });
    expect([names(core), core.index, server.of('Sync').length]).toEqual([[], 0, 0]);
    core.setInPlay(true);
    await settle();
    expect([names(core), core.index, server.of('Sync').length]).toEqual([['Bow', 'Hookshot'], 2, 1]);
  });

  it('moves the index only when the game grants, never at queue time, and queues nothing twice', async () => {
    const { server, core } = await bootWith(makeRoom({ items: five().slice(0, 2) }), (c) => { c.holdGrants = true; });
    expect([core.queued.length, core.index]).toEqual([2, 0]);
    server.push([{ cmd: 'ReceivedItems', index: 0, items: five().slice(0, 2) }]);
    await settle();
    expect(core.queued.length).toBe(2);
    core.grantNext();
    expect(core.index).toBe(1);
    core.grantNext();
    expect([names(core), core.index]).toEqual([['Bow', 'Hookshot'], 2]);
  });

  it('a state loaded from before three items receives exactly those three again (T7)', async () => {
    const { server, core } = await bootWith(makeRoom({ items: five() }));
    expect([names(core).length, core.index]).toEqual([5, 5]);
    core.index = 2;
    core.swapSave();
    await settle();
    expect(server.of('Sync')).toHaveLength(1);
    expect(names(core).slice(5)).toEqual(['Bow', 'Hookshot', 'Bow']);
    expect([core.index, core.cancels]).toEqual([5, 1]);
  });

  it('a swap withdraws what the queue still held for the save that is gone', async () => {
    const { core } = await bootWith(makeRoom({ items: five().slice(0, 2) }), (c) => { c.holdGrants = true; });
    core.grantNext();
    core.swapSave();
    await settle();
    expect([core.cancels, core.queued.map((q) => q.itemName)]).toEqual([1, ['Hookshot']]);
    core.grantNext();
    core.grantNext();
    expect([names(core), core.index, core.queued.length]).toEqual([['Bow', 'Hookshot'], 2, 0]);
  });

  it('binds a fresh save to the room on its first grant, and refuses a save of another room', async () => {
    const fresh = await bootWith(makeRoom({ items: five().slice(0, 1), seedName: 'seed-A' }));
    expect([names(fresh.core), fresh.core.roomHash]).toEqual([['Bow'], roomHashOf('seed-A')]);

    const same = await bootWith(makeRoom({ items: five().slice(0, 1), seedName: 'seed-A' }), (c) => { c.roomHash = roomHashOf('seed-A'); });
    expect([names(same.core), same.session.status]).toEqual([['Bow'], 'active']);

    logged.length = 0;
    const other = await bootWith(makeRoom({ items: five().slice(0, 1), seedName: 'seed-B' }), (c) => { c.roomHash = roomHashOf('seed-A'); });
    expect([names(other.core), other.core.index, other.session.status]).toEqual([[], 0, 'error']);
    expect(other.core.roomHash).toBe(roomHashOf('seed-A'));
    expect(logged).toContain(ROOM_MISMATCH);
    expect(ROOM_MISMATCH).toContain('This save belongs to another Archipelago room');
  });
});

describe('the room\'s checked locations', () => {
  const twoChecks = (): Partial<FakeRoom> => ({
    games: {
      [OWN]: {
        item_name_to_id: { Bow: 100, Hookshot: 101 }, location_name_to_id: { 'check-001': 1, 'check-002': 2 }, checksum: 'own-2',
      },
    },
    checked: [1],
    missing: [2],
  });

  it('marks the connect\'s and every room update\'s checks collected, and never reports them', async () => {
    const { server, core } = await bootWith(makeRoom(twoChecks()), (c) => { c.localComplete = new Set(['check-001']); });
    expect([...core.collected]).toEqual(['check-001']);
    server.push([{ cmd: 'RoomUpdate', checked_locations: [2] }]);
    await settle();
    expect([...core.collected]).toEqual(['check-001', 'check-002']);
    // The save now shows it done too; a reconnect's baseline still does not report it.
    core.localComplete.add('check-002');
    server.drop();
    await settle();
    await vi.advanceTimersByTimeAsync(1000);
    await settle();
    expect(server.of('LocationChecks')).toHaveLength(0);
  });
});
