/* @layer tests @kind test */
/**
 * Reaching the room, against the fake server and the recording core: a server that is down
 * at the first connect is retried on the backoff with a countdown until it answers, and a
 * refusal is not retried and reads as one sentence. An item at a negative location is the
 * server's own, even when this slot asked for it. The save in play is bound to the room at
 * Connected and after every save swap, before any check or item crosses: a save of another
 * room ends the session with nothing sent.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createOnlineClient } from '@app/lib/game/randomizer-client/online-client';
import { backoffDelay } from '@app/lib/game/randomizer-client/reconnect';
import { refusalText } from '@app/lib/game/randomizer-client/refusal-text';
import { roomHashOf } from '@app/lib/game/randomizer-client/room-hash';
import { ROOM_MISMATCH } from '@app/lib/game/randomizer-client/online-room-identity';
import { createFakeServer } from './ap-fake-server';
import { createFakeCore } from './ap-fake-core';
import type { FakeRoom } from './ap-fake-server';
import type { FakeCore } from './ap-fake-core';

const logged = vi.hoisted(() => [] as string[]);

vi.mock('@app/lib/log-bus', () => {
  const quiet = (): void => undefined;
  const randomizer = (message: string): void => { logged.push(message); };
  return { log: { core: quiet, app: quiet, randomizer, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});

const OWN = 'Relic of the Past';
const URL = 'ws://host:1';

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
  seedName: 'seed-A',
  ...overrides,
});

const item = (id: number, player: number, location: number) => ({ item: id, player, location, flags: 0 });

const settle = async (): Promise<void> => {
  for (let i = 0; i < 60; i += 1) await Promise.resolve();
};

const bootWith = async (room: FakeRoom, prepare: (core: FakeCore) => void = () => undefined, password?: string) => {
  const server = createFakeServer(room);
  const core = createFakeCore();
  prepare(core);
  const session = createOnlineClient({ url: URL, slotName: 'Link', password }, { core, createSocket: server.createSocket });
  await session.start();
  await settle();
  return { server, core, session };
};

const wait = async (ms: number): Promise<void> => {
  await vi.advanceTimersByTimeAsync(ms);
  await settle();
};

beforeEach(() => {
  vi.useFakeTimers();
  logged.length = 0;
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

describe('reaching the room', () => {
  it('retries a server that is down at the first connect, with a countdown, until it answers (T02)', async () => {
    const room = makeRoom({ refusedUrls: new Set([URL]) });
    const { server, session } = await bootWith(room);
    expect(session.status).toBe('reconnecting');
    expect(session.networkStatus.connection).toMatchObject({
      state: 'reconnecting', reconnectAttempt: 1, nextRetryAt: Date.now() + 1000, error: `Could not reach ${URL}`,
    });
    await wait(1000);
    expect(session.networkStatus.connection).toMatchObject({ reconnectAttempt: 2, nextRetryAt: Date.now() + 2000 });
    await wait(2000);
    expect(session.networkStatus.connection).toMatchObject({ reconnectAttempt: 3, nextRetryAt: Date.now() + 4000 });
    room.refusedUrls.clear();
    await wait(4000);
    expect(session.status).toBe('active');
    expect(session.networkStatus.connection).toMatchObject({ state: 'connected', reconnectAttempt: 0, error: null });
    expect(server.urls).toHaveLength(4);
    expect([0, 1, 2, 3, 4, 5, 6].map(backoffDelay)).toEqual([1000, 2000, 4000, 8000, 16000, 30000, 30000]);
  });

  it('never retries a refusal, and names it in one sentence with the code kept in the log (T03)', async () => {
    const { server, session } = await bootWith(makeRoom({ password: 'pw' }), undefined, 'nope');
    await wait(60000);
    expect(session.status).toBe('error');
    expect(server.of('Connect')).toHaveLength(1);
    expect(session.networkStatus.connection.error).toBe('Wrong room password.');
    expect(logged).toContain('[Online] Connection refused (InvalidPassword): Wrong room password.');
  });

  it('has a sentence for each refusal code', () => {
    expect(['InvalidSlot', 'InvalidGame', 'IncompatibleVersion', 'InvalidPassword', 'InvalidItemsHandling', 'Odd']
      .map((code) => refusalText([code], 'Link'))).toEqual([
      'No player named Link in this room.',
      'This room has no Relic of the Past player named Link.',
      'The server needs a newer client.',
      'Wrong room password.',
      'The server refused this client\'s settings.',
      'The server refused the connection (Odd).',
    ]);
  });
});

describe('who sent an item', () => {
  it('a negative location is the server, even when this slot asked; a real own pickup is an echo (T16)', async () => {
    const items = [item(101, 1, 1), item(100, 1, -1), item(101, 1, -2), item(100, 2, 900)];
    const { core } = await bootWith(makeRoom({ items }), (c) => { c.armedLocations.add(1); });
    expect(core.delivered).toEqual([
      { itemName: 'Bow', sender: null }, { itemName: 'Hookshot', sender: null }, { itemName: 'Bow', sender: 'Zelda' },
    ]);
    expect(core.index).toBe(4);
    expect(logged).toContain('[Online] Received: Bow from the server');
    expect(logged).toContain('[Online] Received: Bow from Zelda');
  });
});

describe('the save is bound to the room first (T20b)', () => {
  const otherRoom = (c: FakeCore): void => {
    c.roomHash = roomHashOf('seed-A');
    c.index = 3;
    c.localComplete.add('check-001');
  };

  it('a save of another room ends the session at Connected, with no check, scout or item sent', async () => {
    const { server, core, session } = await bootWith(makeRoom({ seedName: 'seed-B', items: [item(100, 2, 900)] }), otherRoom);
    expect([server.of('LocationChecks'), server.of('LocationScouts'), server.of('Sync')]).toEqual([[], [], []]);
    expect([core.delivered, core.index, core.roomHash]).toEqual([[], 3, roomHashOf('seed-A')]);
    expect(session.status).toBe('error');
    expect(session.networkStatus.connection.error).toBe(ROOM_MISMATCH.replace('[Online] ', ''));
  });

  it('a fresh save is bound at Connected, before its checks are reported', async () => {
    const { server, core } = await bootWith(makeRoom(), (c) => { c.localComplete.add('check-001'); });
    expect(core.roomHash).toBe(roomHashOf('seed-A'));
    expect(server.of('LocationChecks')).toEqual([{ cmd: 'LocationChecks', locations: [1] }]);
  });

  it('a file entered later is bound then, and a swap to another room\'s save ends the session unsynced', async () => {
    const { server, core, session } = await bootWith(makeRoom(), (c) => { c.inPlay = false; });
    expect(core.roomHash).toBe(0);
    core.setInPlay(true);
    await settle();
    expect([core.roomHash, server.of('Sync').length]).toEqual([roomHashOf('seed-A'), 1]);
    core.roomHash = roomHashOf('seed-B');
    core.swapSave();
    await settle();
    expect([server.of('Sync').length, session.status]).toEqual([1, 'error']);
  });
});
