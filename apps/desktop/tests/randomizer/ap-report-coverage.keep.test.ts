/* @layer tests @kind test */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildOptionsSnapshot, generateFromSnapshot, AP_ITEM_IDS, AP_LOCATION_IDS, locationKeyOfApId, checkIdOfLocation } from '@rotp/randomizer';
import { find } from '@rotp/game-data';
import type { ItemKey, LocationKey, OptionValue } from '@rotp/randomizer';
import type { CheckId } from '@rotp/game-data';
import type * as FireRegistry from '@app/game/randomizer-client/override-fire-registry';

const errors = vi.hoisted(() => [] as string[]);
const allocated = vi.hoisted(() => new Set<string>());

vi.mock('@app/log-bus', () => {
  const quiet = (): void => undefined;
  const error = (line: string): void => { errors.push(line); };
  const randomizer = (line: string, level?: string): void => {
    if (level === 'error' || level === 'warn') errors.push(line);
  };
  return { log: { core: quiet, app: quiet, randomizer, wasm: quiet, ipc: quiet, sim: quiet, error } };
});
vi.mock('@app/game/session-dialogue', () => ({
  setSessionReceiptMessages: (lines: unknown[]) => lines.map((_, index) => 1000 + index),
  appendSessionReceiptMessage: () => null,
  clearSessionDialogue: () => undefined,
}));
const iconSet = (name: string) => ({ [`apply${name}`]: () => Promise.resolve(true), [`clear${name}`]: () => undefined });
vi.mock('@app/game/gear-icons', () => iconSet('GearIcons'));
vi.mock('@app/game/quiver-icon', () => iconSet('QuiverIcon'));
vi.mock('@app/game/currency-symbols', () => iconSet('CurrencySymbols'));
vi.mock('@app/game/upgrade-icons', () => iconSet('UpgradeIcons'));
vi.mock('@app/game/foreign-icons', () => ({ applyForeignIcons: () => Promise.resolve(false), clearForeignIcons: () => undefined }));
vi.mock('@app/game/randomizer-client/override-fire-registry', async (importOriginal) => {
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
const { setModule } = await import('@rotp/game-core');
const { installFakeModule } = await import('./ap-fake-module');
const { rotpApplier } = await import('@app/randomizer/rotp-randomizer/rotp-applier');
const { rotpApSlot } = await import('@app/randomizer/rotp-randomizer/rotp-ap-slot');
const { disarmFireReporting, firedLocations } = await import('@app/game/randomizer-client/override-fire-registry');
const {
  clearCollectedChecks, isCountedCheck, trackerCheckRecords, trackerStatuses, withCollectedChecks,
} = await import('@rotp/navigation');
const { markCollected } = await import('@app/game/randomizer-client/online-collected');
const {
  probeDeliverableNpcLocations, probeDeliverablePondLocations, probeDeliverableWorldLocations, virtualCheckIdOf,
} = await import('@rotp/randomizer');

const SLOT = 1;
const OTHER_SLOT = 2;

interface CoverageCase {
  name: string;
  overrides: Record<string, OptionValue>;
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
  const placement = generateFromSnapshot({
    seed: 'ap-report-coverage', snapshot,
    deliverable: { npc: probeDeliverableNpcLocations(), capacity: probeDeliverablePondLocations(), world: probeDeliverableWorldLocations() },
  });
  const scouts = (Object.entries(placement.locations) as [LocationKey, ItemKey][])
    .filter(([where, item]) => AP_LOCATION_IDS[where] !== undefined && AP_ITEM_IDS[item] !== undefined)
    .map(([where, item], index) => ({
      item: AP_ITEM_IDS[item] ?? 0, location: AP_LOCATION_IDS[where] ?? 0, flags: 0,
      player: foreignEvery !== undefined && index % foreignEvery === 0 ? OTHER_SLOT : SLOT,
    }));
  const reading = rotpApSlot({
    worldVersion: '0.1.0', seed: placement.seed, options: snapshot.values, medallions: placement.medallions,
    preRolled: { pondDemands: placement.pondDemands, shopPrices: placement.shopPrices }, deathLink: false,
  });
  if (reading.kind !== 'ok') throw new Error(`slot data: ${reading.kind}`);
  return { scouts, reading };
};

const armRoom = async (overrides: Record<string, OptionValue>, foreignEvery: number | undefined) => {
  const module = installFakeModule(setModule);
  const { scouts, reading } = roomOf(overrides, foreignEvery);
  const keyOf = new Map<number, LocationKey>(scouts.map((scout) => [scout.location, locationKeyOfApId(scout.location)]));
  const scouted = scouts.map((scout) => ({
    ...scout, itemName: `Item ${scout.item}`, gameName: 'Other Game', locationKey: keyOf.get(scout.location) ?? '',
  }));
  const placement = reading.placement({ seedName: 'ap-report-coverage', slot: SLOT, team: 0, scouted });
  const foreign = (key: string) => {
    const entry = scouted.find((scout) => scout.locationKey === key);
    return entry === undefined || entry.player === SLOT
      ? undefined
      : { itemName: entry.itemName, playerName: `Player ${entry.player}`, gameName: entry.gameName, flags: entry.flags };
  };
  const outcome = await rotpApplier.apply(placement, {
    tag: '[Online]', reportCheck: () => undefined, suppress: () => undefined, log: () => undefined, foreign,
  });
  module.remove();
  if (!outcome.ok) throw new Error(outcome.refusal);
  const foreignKeys = scouts.filter((scout) => scout.player !== SLOT).map((scout) => locationKeyOfApId(scout.location));
  return { polled: outcome.armed.polled ?? [], placement, keys: [...keyOf.values()], foreignKeys };
};

afterEach(() => {
  disarmFireReporting();
  clearCollectedChecks();
  allocated.clear();
  errors.length = 0;
});

describe('every Archipelago location has a reporting path', { tags: ['standard'] }, () => {
  for (const { name, overrides, foreignEvery } of CASES) {
    it(name, async () => {
      const { polled: entries, placement, keys } = await armRoom(overrides, foreignEvery);
      const polled = new Set(entries
        .filter((entry) => entry.baselineOnly !== true && (entry.probe !== undefined || entry.checkId !== undefined))
        .map((entry) => entry.key));
      expect(keys.filter((key) => !allocated.has(key) && !polled.has(key))).toEqual([]);
      expect(errors).toEqual([]);

      const counted = trackerCheckRecords(find('check', () => true), placement)
        .filter((check) => isCountedCheck(check));
      expect(counted.length).toBe(keys.length);
    });
  }
});

describe('every collected location shows as done', { tags: ['standard'] }, () => {
  it('a collect of every other player\'s item ticks each row, restocks and pond rungs too', async () => {
    const { placement, keys, foreignKeys } = await armRoom({}, 3);
    expect(foreignKeys.some((key) => checkIdOfLocation(key) === undefined)).toBe(true);
    markCollected(foreignKeys);

    const rows = trackerCheckRecords(find('check', () => true), placement);
    const statuses = trackerStatuses({
      placement, checks: rows, inventory: new Set(),
      completed: withCollectedChecks(new Set<CheckId>()), fired: firedLocations(),
    });
    const rowIdOf = (key: LocationKey): CheckId => checkIdOfLocation(key) ?? virtualCheckIdOf(key);
    expect(foreignKeys.filter((key) => statuses.get(rowIdOf(key)) !== 'completed')).toEqual([]);
    const counted = rows.filter((check) => isCountedCheck(check));
    expect(counted.length).toBe(keys.length);
    expect(counted.filter((check) => statuses.get(check.id) === 'completed').length).toBe(foreignKeys.length);
    const rungs = rows.filter((check) => check.id.startsWith('check-virtual-slot-pond-'));
    expect(rungs.length).toBeGreaterThan(0);
    expect(rungs.filter((check) => check.kind !== 'pond-slot').map((check) => check.name)).toEqual([]);
  });
});
