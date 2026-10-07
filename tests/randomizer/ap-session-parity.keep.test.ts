/* @layer tests @kind test */
/**
 * T12, solo on a server vs local: a local seed and a one-player room serving the same seed
 * (ap-solo-room.ts) must set the game up identically. Both sessions run against the same
 * recording core (ap-fake-module.ts): every override, gate, table and file the core is
 * handed, plus every receipt line composed and every icon set applied, is the ARMED SET.
 * The two sets must match call for call and argument for argument, in any order.
 *
 * The one planned difference is the online bits of gate word 5, set for the session's life:
 * each online write of the word must carry kFeatures5_ApOnline, and with it masked off the
 * word must be the local one.
 *
 * The foreign case puts another player's item on every pond rung, every pond prize and a
 * shop shelf: the room scouts them to a second slot, the local seed carries `item-foreign`
 * at the same spots, and no setter may refuse the sentinel.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildOptionsSnapshot, normalizeRandomizerOptions } from '@shared/randomizer/options-snapshot';
import { generateFromSnapshot } from '@shared/randomizer/generate';
import { installFakeModule } from './ap-fake-module';
import { createFakeServer } from './ap-fake-server';
import { soloRoomOf } from './ap-solo-room';
import { deliverableSetsOf } from '@shared/randomizer/world/fill/deliverable-lists';
import { RETRO_QUIVER_ITEM } from '@shared/randomizer/world/retro/retro-bow.data';
import { FOREIGN_ITEM_KEY } from '@shared/randomizer/archipelago/foreign-item';
import { AP_LOCATION_IDS } from '@shared/randomizer/archipelago/ap-ids.data';
import { isShopSlotLocation } from '@shared/randomizer/world/shops/shop-slots';
import { stripHighlight } from '@shared/randomizer/receipt-text/highlight-markup';
import type { DeliverableLists } from '@shared/randomizer/world/fill/deliverable-lists';
import type { FakeRoom } from './ap-fake-server';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { OptionValue } from '@shared/randomizer/world/options.type';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';

const armed = vi.hoisted(() => [] as string[]);
const errors = vi.hoisted(() => [] as string[]);

vi.mock('@app/lib/log-bus', () => {
  const quiet = (): void => undefined;
  const error = (line: string): void => { errors.push(line); };
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error } };
});
// The composed dialogue and the extracted icon sets need a real asset blob and a ROM; what
// the session hands them is the part that must match.
vi.mock('@app/lib/game/session-dialogue', () => ({
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
vi.mock('@app/lib/game/gear-icons', () => iconSet('GearIcons'));
vi.mock('@app/lib/game/quiver-icon', () => iconSet('QuiverIcon'));
vi.mock('@app/lib/game/currency-symbols', () => iconSet('CurrencySymbols'));
vi.mock('@app/lib/game/upgrade-icons', () => iconSet('UpgradeIcons'));
// No pool icons in the core: the room arms the plain sentinel, the id a local seed arms.
vi.mock('@app/lib/game/foreign-icons', () => ({ applyForeignIcons: async () => false, clearForeignIcons: () => undefined }));

// The bridge's import graph reaches the input and IPC layers, which call the preload API at
// load; every call answers an empty list, and no file or profile is ever touched.
const answerEmpty = (): Promise<unknown[]> => Promise.resolve([]);
const preloadApi: unknown = new Proxy({}, { get: () => new Proxy(answerEmpty, { get: () => answerEmpty }) });
(globalThis as { window?: unknown }).window ??= {
  addEventListener: () => undefined, removeEventListener: () => undefined, api: preloadApi,
};
// The modules that call the bridge at load go first, so the bridge finishes loading before
// those calls (the bridge's re-exports reach them again through the input layer).
await import('@app/lib/game/cheats');
const { setModule } = await import('@app/lib/game/wasm-bridge');
const { createLocalSession } = await import('@app/lib/game/randomizer-client/local-session');
const { createOnlineClient } = await import('@app/lib/game/randomizer-client/online-client');
const { defaultOnlineCore } = await import('@app/lib/game/randomizer-client/online-core');
const { AP_ONLINE_BIT, AP_DEATH_LINK_BIT } = await import('@app/lib/game/gate-word-5');
const {
  probeDeliverableNpcLocations, probeDeliverablePondLocations, probeDeliverableWorldLocations,
} = await import('@app/lib/game/randomizer-client/npc-capability');
const { resolveLocalItemId } = await import('@app/lib/game/randomizer-client/item-lookup');

/** The single-arrow receipt, which the retro shelf also sells as the quiver (retro_shelf.c). */
const QUIVER_RECEIPT = 0x43;

const SEED = 'parity-t12';
const WORD_5 = /^WasmSetGateWord\(\[5,(\d+)\]\)$/;
const AP_BITS = AP_ONLINE_BIT | AP_DEATH_LINK_BIT;

// The shipped defaults already open npc checks, world items, key drops, a custom capacity
// pond and progressive custom capacity, so the other three each move one of those.
// The last case carries its spots through slot data the way a player file hands them to the
// server, as a strict subset of the probes, so a client that ignored them would arm more.
interface ParityCase {
  name: string;
  overrides: Record<string, OptionValue>;
  carried?: boolean;
  quiver?: boolean;
  foreign?: boolean;
}

const CASES: readonly ParityCase[] = [
  { name: 'the default snapshot (npc checks on)', overrides: {} },
  {
    name: 'npc checks, world items and key drops off (locked vanilla rows)',
    overrides: { include_npc_checks: false, include_world_items: false, key_drop_shuffle: false },
  },
  {
    name: 'the capacity pond on four prizes, asking for each',
    overrides: {
      pond_capacity_mode: 'custom', pond_capacity_items: 4, pond_capacity_throws: 4,
      pond_capacity_ask_rupees_min: '900', pond_capacity_ask_rupees_max: '999',
    },
  },
  {
    name: 'custom capacity in fixed jumps',
    overrides: {
      capacity_progressive: false, capacity_explosives_mode: 'custom',
      capacity_wallet_mode: 'custom', capacity_wallet_start: '0', capacity_wallet_max: '999',
    },
  },
  { name: 'npc, pond and world spots carried in slot data', overrides: {}, carried: true },
  // The quiver has no record: it is placed like any item and arrives as the single-arrow
  // receipt, the one the running game reads as the bow's quiver.
  { name: 'the retro bow, its quiver placed in the pool', overrides: { retro_bow: true, shop_item_slots: 6 }, quiver: true },
  {
    name: 'another player\'s items on every pond rung, every pond prize and a shop shelf',
    overrides: {
      pond_capacity_mode: 'custom', pond_capacity_items: 4, pond_capacity_throws: 4,
      pond_wishing_mode: 'custom', pond_wishing_items: 4, pond_wishing_throws: 4,
      pond_cursed_mode: 'custom', pond_cursed_items: 4, pond_cursed_throws: 4, shop_item_slots: 6,
    },
    foreign: true,
  },
];

const OTHER_SLOT = 2;

/** Every placed pond slot, and the first placed shop shelf: the spots the case hands away. */
const foreignSpotsOf = (placement: Placement): LocationKey[] => {
  const keys = Object.keys(placement.locations) as LocationKey[];
  const ponds = keys.filter((key) => key.startsWith('slot-pond-'));
  const shelf = keys.filter((key) => isShopSlotLocation(key)).sort()[0];
  return shelf === undefined ? ponds : [...ponds, shelf];
};

/** The same seed with |spots| holding another player's item, locally and on the server. */
const handAway = (placement: Placement, room: FakeRoom, spots: readonly LocationKey[]): Placement => {
  const locations = { ...placement.locations };
  for (const spot of spots) {
    locations[spot] = FOREIGN_ITEM_KEY;
    const scout = room.placements[AP_LOCATION_IDS[spot] ?? -1];
    if (scout !== undefined) scout.player = OTHER_SLOT;
  }
  room.players.push({ team: 0, slot: OTHER_SLOT, alias: 'Zelda', name: 'Zelda' });
  room.slotInfo[OTHER_SLOT] = { name: 'Zelda', game: room.slotInfo[1].game, type: 1, group_members: [] };
  return { ...placement, locations };
};

/** A foreign line as the room composes it: its candidates, ending in the owner alone. */
const NAMED_FOREIGN_LINE = /\[(?:"(?:[^"\\]|\\.)*",)*"Sent to Zelda!"\]/g;

/** A foreign setter call carries the sentinel as its item argument. */
const FOREIGN_ARMS = [/^WasmSetPondPrize\(\[\d+,254,/, /^WasmArmWishPondPlan\(\[\d+,\d+,254,/, /^WasmSetShopSlotOverride\(\[(?:-?\d+,){9}254,/];

/** Every other probed spot of each set: non-empty, and never the whole probe. */
const carriedLists = (): DeliverableLists => {
  const half = (set: ReadonlySet<LocationKey>): LocationKey[] => [...set].sort().filter((_, i) => i % 2 === 0);
  return {
    npc: half(probeDeliverableNpcLocations()),
    pond: half(probeDeliverablePondLocations()),
    world: half(probeDeliverableWorldLocations()),
  };
};

const settle = async (): Promise<void> => {
  for (let i = 0; i < 400; i += 1) await Promise.resolve();
};

/** The armed set, gate word 5 split out with the online bits masked, the lines read as plain text. */
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
        // A room names the item and its owner in the foreign line; a local seed has nothing to name.
        const unnamed = onlineSet.rest.map((call) => call.replace(NAMED_FOREIGN_LINE, '"Sent to another player!"'));
        if (foreign) expect(onlineSet.rest.some((call) => call.includes(' sent to Zelda!"'))).toBe(true);
        expect(unnamed.sort()).toEqual(localSet.rest);
        expect(onlineSet.word5.every((word) => (word & AP_ONLINE_BIT) !== 0)).toBe(true);
        expect(onlineSet.word5.map((word) => word & ~AP_BITS)).toEqual(localSet.word5);
        expect(online.placement?.locations).toEqual(placement.locations);
        expect(online.placement?.stats.storyGates).toEqual(placement.stats.storyGates);
        // The room re-counts its spheres over the items it holds, and the handed-away ones are gone.
        const spheres = foreign ? { sphereCount: 0 } : {};
        expect({ ...online.placement?.stats, ...spheres }).toEqual({ ...placement.stats, ...spheres });
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
