/* @layer tests @kind test */
/**
 * Every location of an Archipelago placement has a way to reach the room. A session sends a
 * location's LocationChecks from one of two paths: the substitution seam (an armed override's
 * fire id, override-fire-registry.ts) or the poller (a plan detection, or the tracker's own
 * sweep over the record). A location with neither can never be sent, so the item on it never
 * reaches its owner and the room can never finish.
 *
 * The room is a generated seed served as scouts under the frozen ids, armed through the same
 * armScouted the live session runs. The default options are also the options of the first
 * two-game test room (Relic next to Ship of Harkinian, 341 locations), so the first case is
 * that room's shape. The tracker's check total must equal the room's location count too:
 * events and status-only rows stay listed, but they are not locations of the slot.
 *
 * After a collect, every location the room holds as checked shows done on its row, the shop
 * restocks and pond rungs included, which have no record and read the taken set instead.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildOptionsSnapshot } from '@shared/randomizer/options-snapshot';
import { generateFromSnapshot } from '@shared/randomizer/generate';
import { AP_ITEM_IDS, AP_LOCATION_IDS } from '@shared/randomizer/archipelago/ap-ids.data';
import { locationKeyOfApId } from '@shared/randomizer/archipelago/ap-id-lookup';
import { find } from '@shared/game/data';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import { checkIdOfLocation } from '@shared/randomizer/world/location-record';
import type { CheckId } from '@shared/game/data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { OptionValue } from '@shared/randomizer/world/options.type';
import type * as FireRegistry from '@app/lib/game/randomizer-client/override-fire-registry';

const errors = vi.hoisted(() => [] as string[]);
const allocated = vi.hoisted(() => new Set<string>());

vi.mock('@app/lib/log-bus', () => {
  const quiet = (): void => undefined;
  const error = (line: string): void => { errors.push(line); };
  const randomizer = (line: string, level?: string): void => {
    if (level === 'error' || level === 'warn') errors.push(line);
  };
  return { log: { core: quiet, app: quiet, randomizer, wasm: quiet, ipc: quiet, sim: quiet, error } };
});
vi.mock('@app/lib/game/session-dialogue', () => ({
  setSessionReceiptMessages: (lines: unknown[]) => lines.map((_, index) => 1000 + index),
  appendSessionReceiptMessage: () => null,
  clearSessionDialogue: () => undefined,
}));
const iconSet = (name: string) => ({ [`apply${name}`]: async () => true, [`clear${name}`]: () => undefined });
vi.mock('@app/lib/game/gear-icons', () => iconSet('GearIcons'));
vi.mock('@app/lib/game/quiver-icon', () => iconSet('QuiverIcon'));
vi.mock('@app/lib/game/currency-symbols', () => iconSet('CurrencySymbols'));
vi.mock('@app/lib/game/upgrade-icons', () => iconSet('UpgradeIcons'));
vi.mock('@app/lib/game/foreign-icons', () => ({ applyForeignIcons: async () => false, clearForeignIcons: () => undefined }));
// Records every location the session hands a fire id: the substitution path of that location.
vi.mock('@app/lib/game/randomizer-client/override-fire-registry', async (importOriginal) => {
  const real = await importOriginal<typeof FireRegistry>();
  return {
    ...real,
    allocateFireId: (location: LocationKey) => {
      allocated.add(location);
      return real.allocateFireId(location);
    },
  };
});

const answerEmpty = (): Promise<unknown[]> => Promise.resolve([]);
const preloadApi: unknown = new Proxy({}, { get: () => new Proxy(answerEmpty, { get: () => answerEmpty }) });
(globalThis as { window?: unknown }).window ??= {
  addEventListener: () => undefined, removeEventListener: () => undefined, api: preloadApi,
};
await import('@app/lib/game/cheats');
const { setModule } = await import('@app/lib/game/wasm-bridge');
const { installFakeModule } = await import('./ap-fake-module');
const { armScouted } = await import('@app/lib/game/randomizer-client/online-arm-scouted');
const { disarmFireReporting, firedLocations } = await import('@app/lib/game/randomizer-client/override-fire-registry');
const { trackerCheckRecords } = await import('@app/lib/game/tracker/tracker-roster');
const { isCountedCheck } = await import('@app/lib/game/tracker/tracker-count');
const { trackerStatuses } = await import('@app/lib/game/tracker/tracker-statuses');
const { clearCollectedChecks, withCollectedChecks } = await import('@app/lib/game/tracker/collected-checks');
const { markCollected } = await import('@app/lib/game/randomizer-client/online-collected');
const { virtualCheckIdOf } = await import('@app/lib/game/randomizer-client/virtual-locations');
const { parseSlotData } = await import('@shared/randomizer/archipelago/parse-slot-data');
const {
  probeDeliverableNpcLocations, probeDeliverablePondLocations, probeDeliverableWorldLocations,
} = await import('@app/lib/game/randomizer-client/npc-capability');

const SLOT = 1;
const OTHER_SLOT = 2;

interface CoverageCase {
  name: string;
  overrides: Record<string, OptionValue>;
  /** Every Nth location holds another player's item, as in a real multiworld. */
  foreignEvery?: number;
}

const CASES: readonly CoverageCase[] = [
  { name: 'the default options (the two-game test room\'s own)', overrides: {} },
  { name: 'the default options, every third location another player\'s', overrides: {}, foreignEvery: 3 },
  {
    name: 'npc checks, world items and key drops off (locked vanilla rows)',
    overrides: { include_npc_checks: false, include_world_items: false, key_drop_shuffle: false },
    foreignEvery: 4,
  },
];

const roomOf = (overrides: Record<string, OptionValue>, foreignEvery: number | undefined) => {
  const snapshot = buildOptionsSnapshot(overrides);
  const placement = generateFromSnapshot('ap-report-coverage', snapshot, probeDeliverableNpcLocations(),
    probeDeliverablePondLocations(), probeDeliverableWorldLocations());
  const scouts = (Object.entries(placement.locations) as [LocationKey, ItemKey][])
    .filter(([where, item]) => AP_LOCATION_IDS[where] !== undefined && AP_ITEM_IDS[item] !== undefined)
    .map(([where, item], index) => ({
      item: AP_ITEM_IDS[item] ?? 0, location: AP_LOCATION_IDS[where] ?? 0, flags: 0,
      player: foreignEvery !== undefined && index % foreignEvery === 0 ? OTHER_SLOT : SLOT,
    }));
  const slotData = parseSlotData({
    worldVersion: '0.1.0', seed: placement.seed, options: snapshot.values, medallions: placement.medallions,
    preRolled: { pondDemands: placement.pondDemands ?? {}, shopPrices: placement.shopPrices ?? {} }, deathLink: false,
  });
  if (slotData.kind !== 'ok') throw new Error(`slot data: ${slotData.kind}`);
  return { scouts, slotData: slotData.slotData };
};

/** The room armed through the live session's armScouted, with the keys the scouts name. */
const armRoom = async (overrides: Record<string, OptionValue>, foreignEvery: number | undefined) => {
  const module = installFakeModule(setModule);
  const { scouts, slotData } = roomOf(overrides, foreignEvery);
  const maps = {
    keyByLocationId: new Map<number, LocationKey>(), locationIdByKey: new Map<LocationKey, number>(),
    overriddenLocationIds: new Set<number>(),
  };
  for (const { location } of scouts) {
    const key = locationKeyOfApId(location);
    maps.keyByLocationId.set(location, key);
    maps.locationIdByKey.set(key, location);
  }
  const outcome = await armScouted({
    scouts, maps, slot: SLOT, slotData, seedName: 'ap-report-coverage',
    playerName: (slot) => `Player ${slot}`, itemName: (id) => `Item ${id}`, gameOf: () => 'Other Game',
    reporter: { reportCheck: () => undefined },
  });
  module.remove();
  if (!outcome.ok) throw new Error(outcome.reason);
  const foreignKeys = scouts.filter((scout) => scout.player !== SLOT).map((scout) => locationKeyOfApId(scout.location));
  return { outcome, keys: [...maps.keyByLocationId.values()], foreignKeys };
};

afterEach(() => {
  disarmFireReporting();
  clearCollectedChecks();
  allocated.clear();
  errors.length = 0;
});

describe('every Archipelago location has a reporting path', () => {
  for (const { name, overrides, foreignEvery } of CASES) {
    it(name, async () => {
      const { outcome, keys } = await armRoom(overrides, foreignEvery);
      const polled = new Set((outcome.pollEntries ?? [])
        .filter((entry) => entry.baselineOnly !== true && (entry.detection !== undefined || entry.checkId !== undefined))
        .map((entry) => entry.key));
      expect(keys.filter((key) => !allocated.has(key) && !polled.has(key))).toEqual([]);
      expect(errors).toEqual([]);

      if (outcome.placement === null) throw new Error('the scouts armed no placement');
      const counted = trackerCheckRecords(find('check', () => true), outcome.placement)
        .filter((check) => isCountedCheck(check));
      expect(counted.length).toBe(keys.length);
    });
  }
});

describe('every collected location shows as done', () => {
  it('a collect of every other player\'s item ticks each row, restocks and pond rungs too', async () => {
    const { outcome, keys, foreignKeys } = await armRoom({}, 3);
    if (outcome.placement === null) throw new Error('the scouts armed no placement');
    expect(foreignKeys.some((key) => checkIdOfLocation(key) === undefined)).toBe(true);
    markCollected(foreignKeys);

    const rows = trackerCheckRecords(find('check', () => true), outcome.placement);
    const statuses = trackerStatuses({
      placement: outcome.placement, checks: rows, inventory: new Set(),
      completed: withCollectedChecks(new Set<CheckId>()), fired: firedLocations(),
    });
    const rowIdOf = (key: LocationKey): CheckId => checkIdOfLocation(key) ?? virtualCheckIdOf(key);
    expect(foreignKeys.filter((key) => statuses.get(rowIdOf(key)) !== 'completed')).toEqual([]);
    const counted = rows.filter((check) => isCountedCheck(check));
    expect(counted.length).toBe(keys.length);
    expect(counted.filter((check) => statuses.get(check.id) === 'completed').length).toBe(foreignKeys.length);
    // A pond rung with no record is typed like the rungs that have one.
    const rungs = rows.filter((check) => check.id.startsWith('check-virtual-slot-pond-'));
    expect(rungs.length).toBeGreaterThan(0);
    expect(rungs.filter((check) => check.kind !== 'pond-slot').map((check) => check.name)).toEqual([]);
  });
});
