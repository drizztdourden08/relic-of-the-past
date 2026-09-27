/* @layer shared-game @kind logic */
/**
 * The scope tables, read off the records and keyed by check id.
 *
 * WHICH app-scope switch a location answers to is on its own check record (`scope`), so a new
 * check declares its own scope where it is written and there is no second list to keep in
 * step. WHAT it holds comes from the record too, translated into the baseline pool's terms
 * where the two vocabularies differ (pool-items.ts).
 *
 * With its switch off, a scoped location is pre-placed LOCKED with the item named here and
 * left out of the fill, which is the mechanism the key-drop option has always used.
 *
 * ROW ORDER. The two scope tables are in name order, which is the order the fill subtracts
 * their items from the pool and the order it locks them onto their locations. The key drops
 * are in record order, which is their dungeons' order and then each dungeon's own.
 *
 * TWO LISTS ARE NOT SCOPE. The prize slots are every check of kind 'prize', and the event
 * locations are the ones the fill hands an event item to instead of a pool item, which is
 * the fill's own pairing (pool/event-items.data.ts) and includes one location with no check
 * record at all by design.
 */
import { all } from '@shared/game/data';
import { standardNameOfCheck } from '@shared/game/data/check-standard-name';
import { EVENT_ITEMS } from './pool/event-items.data';
import { poolItemOfCheck } from './pool-items';
import type { ItemId } from '@shared/game/data/types/ids';
import type { CheckRecord } from '@shared/game/data';
import type { LocationKey } from './location-key';

type Scope = NonNullable<CheckRecord['scope']>;

const scopedChecks = (scope: Scope): readonly CheckRecord[] =>
  all('check').filter((check) => check.scope === scope);

const rowsOf = (checks: readonly CheckRecord[]): [LocationKey, ItemId][] => checks.flatMap((check) => {
  const item = poolItemOfCheck(check);
  return item === undefined ? [] : [[check.id, item] as [LocationKey, ItemId]];
});

/** Name order, which is what decides the order the fill locks these rows down in. */
const byName = (checks: readonly CheckRecord[]): readonly CheckRecord[] =>
  [...checks].sort((a, b) => (standardNameOfCheck(a) < standardNameOfCheck(b) ? -1 : 1));

const tableOf = (scope: Scope): ReadonlyMap<LocationKey, ItemId> =>
  new Map(rowsOf(byName(scopedChecks(scope))));

/** `include_npc_checks`: scripted givers, boss heart containers and the fairy waters. */
const NPC_SCOPE_LOCATIONS: ReadonlyMap<LocationKey, ItemId> = tableOf('npc');

/** `include_world_items`: standing in-world items, the tablets, the pedestal, the dig prizes. */
const WORLD_ITEM_SCOPE_LOCATIONS: ReadonlyMap<LocationKey, ItemId> = tableOf('world-item');

/** `key_drop_shuffle`: the spots that exist only with that option, each holding its own key. */
const KEY_DROP_LOCATIONS: ReadonlyMap<LocationKey, ItemId> = new Map(rowsOf(scopedChecks('key-drop')));

/** The capacity water's pair, which exists only while its family is not vanilla. */
const CAPACITY_UPGRADE_LOCATIONS: ReadonlyMap<LocationKey, ItemId> = new Map(rowsOf(scopedChecks('capacity')));

/** The ten boss prize slots. */
const PRIZE_LOCATIONS: ReadonlySet<LocationKey> = new Set(
  all('check').filter((check) => check.kind === 'prize').map((check) => check.id),
);

/** Each dungeon's vanilla boss prize, keyed by its prize location. */
const VANILLA_PRIZES: ReadonlyMap<LocationKey, ItemId> = new Map(
  rowsOf(all('check').filter((check) => check.kind === 'prize')),
);

/** The locations the fill hands a logic event to; they never carry a pool item. */
const EVENT_LOCATIONS: ReadonlySet<LocationKey> = new Set(EVENT_ITEMS.keys());

export {
  CAPACITY_UPGRADE_LOCATIONS, EVENT_LOCATIONS, KEY_DROP_LOCATIONS, NPC_SCOPE_LOCATIONS,
  PRIZE_LOCATIONS, VANILLA_PRIZES, WORLD_ITEM_SCOPE_LOCATIONS,
};
