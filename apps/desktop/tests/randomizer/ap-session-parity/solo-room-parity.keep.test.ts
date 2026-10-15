/* @layer tests @kind test */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildOptionsSnapshot, normalizeRandomizerOptions, generateFromSnapshot, deliverableSetsOf, RETRO_QUIVER_ITEM, isShopSlotLocation } from '@rotp/randomizer';
import { stripHighlight } from '@rotp/game-core';
import type { DeliverableLists, LocationKey, Placement, RandomizerOptionsSnapshot } from '@rotp/randomizer';
import { installFakeModule } from '../ap-fake-module';
import type { FakeModule } from '../ap-fake-module';
import { createFakeServer } from '../ap-fake-server';
import type { FakeRoom } from '../ap-fake-server';
import { soloRoomOf } from '../ap-solo-room';
import { CASES, FOREIGN_ARMS, NAMED_FOREIGN_LINE, QUIVER_RECEIPT, SEED, WORD_5 } from './parity-cases.data';
import type { ParityCase } from './parity-cases.data';
import { FOREIGN_LINE_TEXT } from './foreign-line.fixture';
import { foreignSpotsOf } from './foreign-spots-of';
import { handAway } from './hand-away';

const armed = vi.hoisted(() => [] as string[]);
const errors = vi.hoisted(() => [] as string[]);

vi.mock('@app/log-bus', () => {
  const quiet = (): void => undefined;
  const error = (line: string): void => { errors.push(line); };
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error } };
});
vi.mock('@app/game/session-dialogue', () => ({
  setSessionReceiptMessages: (lines: unknown[]) => {
    armed.push(`receipt lines ${JSON.stringify(lines)}`);
    return lines.map((_, index) => 1000 + index);
  },
  appendSessionReceiptMessage: (line: unknown) => {
    armed.push(`receipt line ${JSON.stringify(line)}`);
    return null;
  },
  clearSessionDialogue: () => undefined,
}));
const iconSet = (name: string) => ({
  [`apply${name}`]: () => {
    armed.push(`apply${name}`);
    return Promise.resolve(true);
  },
  [`clear${name}`]: () => undefined,
});
vi.mock('@app/game/gear-icons', () => iconSet('GearIcons'));
vi.mock('@app/game/quiver-icon', () => iconSet('QuiverIcon'));
vi.mock('@app/game/currency-symbols', () => iconSet('CurrencySymbols'));
vi.mock('@app/game/upgrade-icons', () => iconSet('UpgradeIcons'));
vi.mock('@app/game/foreign-icons', () => ({ applyForeignIcons: () => Promise.resolve(false), clearForeignIcons: () => undefined }));

const answerEmpty = (): Promise<unknown[]> => Promise.resolve([]);
const preloadApi: unknown = new Proxy({}, { get: () => new Proxy(answerEmpty, { get: () => answerEmpty }) });
(globalThis as { window?: unknown }).window ??= {
  addEventListener: () => undefined, removeEventListener: () => undefined, api: preloadApi,
};
const { setModule } = await import('@rotp/game-core');
const { createLocalSession } = await import('@app/game/randomizer-client/local-session');
const { createOnlineClient } = await import('@app/game/randomizer-client/online-client');
const { defaultOnlineCore } = await import('@app/game/randomizer-client/online-core');
const { AP_ONLINE_BIT, AP_DEATH_LINK_BIT } = await import('@app/game/gate-word-5');
const {
  probeDeliverableNpcLocations, probeDeliverablePondLocations, probeDeliverableWorldLocations, resolveLocalItemId,
} = await import('@rotp/randomizer');

const AP_BITS = AP_ONLINE_BIT | AP_DEATH_LINK_BIT;
const SETTLE_TICKS = 400;

const carriedLists = (): DeliverableLists => {
  const everyOther = (set: ReadonlySet<LocationKey>): LocationKey[] => [...set].sort().filter((_, i) => i % 2 === 0);
  return {
    npc: everyOther(probeDeliverableNpcLocations()),
    pond: everyOther(probeDeliverablePondLocations()),
    world: everyOther(probeDeliverableWorldLocations()),
  };
};

const settle = async (): Promise<void> => {
  for (let i = 0; i < SETTLE_TICKS; i += 1) await Promise.resolve();
};

const armedSet = (calls: readonly string[]): { rest: string[]; word5: number[] } => {
  const word5: number[] = [];
  const rest: string[] = [];
  for (const call of [...calls, ...armed].map(stripHighlight)) {
    const match = WORD_5.exec(call);
    if (match === null) rest.push(call);
    else word5.push(Number(match[1]));
  }
  return { rest: rest.sort(), word5 };
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

type ArmedSet = ReturnType<typeof armedSet>;
type OnlineClient = ReturnType<typeof createOnlineClient>;

interface ParityFacts {
  localSet: ArmedSet;
  onlineSet: ArmedSet;
  online: OnlineClient;
  placement: Placement;
  foreign: boolean | undefined;
}

const generatedFor = (snapshot: RandomizerOptionsSnapshot, lists: DeliverableLists | undefined): Placement => {
  if (lists === undefined) {
    return generateFromSnapshot({
      seed: SEED, snapshot,
      deliverable: { npc: probeDeliverableNpcLocations(), capacity: probeDeliverablePondLocations(), world: probeDeliverableWorldLocations() },
    });
  }
  return generateFromSnapshot({ seed: SEED, snapshot, deliverable: deliverableSetsOf(lists) });
};

const expectForeignSpots = (spots: readonly LocationKey[]): void => {
  expect(spots.filter((spot) => spot.startsWith('slot-pond-capacity')).length).toBeGreaterThan(0);
  expect(spots.filter((spot) => /^slot-pond-(wishing|cursed)/.test(spot)).length).toBeGreaterThan(0);
  expect(spots.some((spot) => isShopSlotLocation(spot))).toBe(true);
};

const caseRoom = ({ overrides, carried, foreign }: ParityCase): { room: FakeRoom; placement: Placement } => {
  const snapshot = normalizeRandomizerOptions(buildOptionsSnapshot(overrides));
  const lists = carried ? carriedLists() : undefined;
  if (lists) expect(lists.npc.length * lists.pond.length * lists.world.length).toBeGreaterThan(0);
  const generated = generatedFor(snapshot, lists);
  const room = soloRoomOf(generated, snapshot, lists);
  if (!foreign) return { room, placement: generated };
  const spots = foreignSpotsOf(generated);
  const placement = handAway(generated, room, spots);
  expectForeignSpots(spots);
  return { room, placement };
};

const expectQuiver = (placement: Placement): void => {
  expect(Object.values(placement.locations)).toContain(RETRO_QUIVER_ITEM);
  expect(resolveLocalItemId('Quiver')).toBe(QUIVER_RECEIPT);
};

const armLocal = async (core: FakeModule, placement: Placement): Promise<ArmedSet> => {
  armed.length = 0;
  const local = createLocalSession(placement);
  await local.start();
  expect(local.status).toBe('active');
  const localSet = armedSet(core.calls);
  local.stop();
  return localSet;
};

const armOnline = async (core: FakeModule, room: FakeRoom): Promise<{ onlineSet: ArmedSet; online: OnlineClient }> => {
  const server = createFakeServer(room);
  const online = createOnlineClient({ url: 'ws://host:1', slotName: 'Link' },
    { core: defaultOnlineCore, createSocket: server.createSocket });
  await online.start();
  expect(core.calls.filter((call) => WORD_5.test(call)).length).toBeGreaterThan(0);
  core.clear();
  armed.length = 0;
  await settle();
  expect(online.status).toBe('active');
  expect(online.placement).not.toBeNull();
  const onlineSet = armedSet(core.calls);
  online.stop();
  await settle();
  return { onlineSet, online };
};

const expectParity = ({ localSet, onlineSet, online, placement, foreign }: ParityFacts): void => {
  expect(localSet.rest.length).toBeGreaterThan(100);
  if (foreign) expect(onlineSet.rest).toContainEqual(expect.stringContaining(' sent to Zelda!"'));
  const unnamed = onlineSet.rest.map((call) => call.replace(NAMED_FOREIGN_LINE, `"${FOREIGN_LINE_TEXT}"`));
  expect(unnamed.sort()).toEqual(localSet.rest);
  expect(onlineSet.word5.every((word) => (word & AP_ONLINE_BIT) !== 0)).toBe(true);
  expect(onlineSet.word5.map((word) => word & ~AP_BITS)).toEqual(localSet.word5);
  expect(online.placement?.locations).toEqual(placement.locations);
  expect(online.placement?.stats.storyGates).toEqual(placement.stats.storyGates);
  const spheresRecounted = foreign ? { sphereCount: 0 } : {};
  expect({ ...online.placement?.stats, ...spheresRecounted }).toEqual({ ...placement.stats, ...spheresRecounted });
  expect(errors.filter((line) => line.includes('refused'))).toEqual([]);
  if (foreign) {
    for (const arm of FOREIGN_ARMS) expect(localSet.rest.some((call) => arm.test(call))).toBe(true);
  }
};

describe('a solo room arms the game exactly like the local seed', () => {
  for (const parityCase of CASES) {
    it(parityCase.name, async () => {
      const { room, placement } = caseRoom(parityCase);
      errors.length = 0;
      if (parityCase.quiver) expectQuiver(placement);
      const core = installFakeModule(setModule);
      try {
        const localSet = await armLocal(core, placement);
        const { onlineSet, online } = await armOnline(core, room);
        expectParity({ localSet, onlineSet, online, placement, foreign: parityCase.foreign });
      } finally {
        core.remove();
      }
    });
  }
});
