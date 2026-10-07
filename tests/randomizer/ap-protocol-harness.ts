/* @layer tests @kind helper */
/**
 * The shared setup of the multiworld client tests (ap-protocol.keep.test.ts,
 * ap-deathlink.keep.test.ts): a two-player room, a client booted against the in-process server
 * (ap-fake-server.ts) with a recording core (ap-fake-core.ts), fake timers and a stand-in
 * localStorage. Each test file still mocks the log bus itself, since a mock is hoisted per file.
 */
import { afterEach, beforeEach, vi } from 'vitest';
import { createOnlineClient } from '@app/lib/game/randomizer-client/online-client';
import { createFakeServer } from './ap-fake-server';
import { createFakeCore } from './ap-fake-core';
import type { FakeRoom } from './ap-fake-server';
import type { OnlineSessionConfig } from '@app/lib/game/randomizer-client/online-session-config.type';

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

/** Fake timers and a stand-in localStorage around every test of the calling file. */
const installClientHarness = (): void => {
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
};

export { boot, installClientHarness, item, makeRoom, OWN, settle };
