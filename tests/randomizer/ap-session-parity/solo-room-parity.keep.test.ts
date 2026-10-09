/* @layer tests @kind test */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildOptionsSnapshot, normalizeRandomizerOptions, generateFromSnapshot, deliverableSetsOf, RETRO_QUIVER_ITEM, isShopSlotLocation } from '@rotp/randomizer';
import { stripHighlight } from '@rotp/game-core';
import type { DeliverableLists, LocationKey } from '@rotp/randomizer';
import { installFakeModule } from '../ap-fake-module';
import { createFakeServer } from '../ap-fake-server';
import { soloRoomOf } from '../ap-solo-room';
import { CASES, FOREIGN_ARMS, NAMED_FOREIGN_LINE, QUIVER_RECEIPT, SEED, WORD_5 } from './parity-cases.data';
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
  [`apply${name}`]: async () => {
    armed.push(`apply${name}`);
    return true;
  },
  [`clear${name}`]: () => undefined,
});
vi.mock('@app/game/gear-icons', () => iconSet('GearIcons'));
vi.mock('@app/game/quiver-icon', () => iconSet('QuiverIcon'));
vi.mock('@app/game/currency-symbols', () => iconSet('CurrencySymbols'));
vi.mock('@app/game/upgrade-icons', () => iconSet('UpgradeIcons'));
vi.mock('@app/game/foreign-icons', () => ({ applyForeignIcons: async () => false, clearForeignIcons: () => undefined }));

const answerEmpty = (): Promise<unknown[]> => Promise.resolve([]);
const preloadApi: unknown = new Proxy({}, { get: () => new Proxy(answerEmpty, { get: () => answerEmpty }) });
(globalThis as { window?: unknown }).window ??= {
  addEventListener: () => undefined, removeEventListener: () => undefined, api: preloadApi,
};
await import('../../../packages/game-core/src/cheats');
const { setModule } = await import('../../../packages/game-core/src/wasm-bridge');
const { createLocalSession } = await import('@app/game/randomizer-client/local-session');
const { createOnlineClient } = await import('@app/game/randomizer-client/online-client');
const { defaultOnlineCore } = await import('@app/game/randomizer-client/online-core');
const { AP_ONLINE_BIT, AP_DEATH_LINK_BIT } = await import('@app/game/gate-word-5');
const {
  probeDeliverableNpcLocations, probeDeliverablePondLocations, probeDeliverableWorldLocations,
} = await import('../../../packages/randomizer/src/client/npc-capability');
const { resolveLocalItemId } = await import('../../../packages/randomizer/src/client/item-lookup');

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

describe('a solo room arms the game exactly like the local seed', () => {
  for (const { name, overrides, carried, quiver, foreign } of CASES) {
    it(name, async () => {
      const snapshot = normalizeRandomizerOptions(buildOptionsSnapshot(overrides));
      const lists = carried ? carriedLists() : undefined;
      const sets = lists ? deliverableSetsOf(lists) : undefined;
      if (lists) expect(lists.npc.length * lists.pond.length * lists.world.length).toBeGreaterThan(0);
      const generated = generateFromSnapshot(SEED, snapshot, sets?.npc ?? probeDeliverableNpcLocations(),
        sets?.capacity ?? probeDeliverablePondLocations(), sets?.world ?? probeDeliverableWorldLocations());
      const room = soloRoomOf(generated, snapshot, lists);
      const spots = foreign ? foreignSpotsOf(generated) : [];
      const placement = foreign ? handAway(generated, room, spots) : generated;
      if (foreign) {
        expect(spots.filter((spot) => spot.startsWith('slot-pond-capacity')).length).toBeGreaterThan(0);
        expect(spots.filter((spot) => /^slot-pond-(wishing|cursed)/.test(spot)).length).toBeGreaterThan(0);
        expect(spots.some((spot) => isShopSlotLocation(spot))).toBe(true);
      }
      errors.length = 0;
      if (quiver) {
        expect(Object.values(placement.locations)).toContain(RETRO_QUIVER_ITEM);
        expect(resolveLocalItemId('Quiver')).toBe(QUIVER_RECEIPT);
      }
      const core = installFakeModule(setModule);
      try {
        armed.length = 0;
        const local = createLocalSession(placement);
        await local.start();
        expect(local.status).toBe('active');
        const localSet = armedSet(core.calls);
        local.stop();

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

        expect(localSet.rest.length).toBeGreaterThan(100);
        const unnamed = onlineSet.rest.map((call) => call.replace(NAMED_FOREIGN_LINE, '"Sent to another player!"'));
        if (foreign) expect(onlineSet.rest.some((call) => call.includes(' sent to Zelda!"'))).toBe(true);
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
      } finally {
        core.remove();
      }
    });
  }
});
