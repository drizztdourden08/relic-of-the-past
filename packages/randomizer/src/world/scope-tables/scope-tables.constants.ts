/* @layer shared-game @kind constants */
import { all } from '@rotp/game-data';
import { scopedChecks } from './scoped-checks';
import { scopeRowsOf } from './scope-rows-of';
import { scopeTableOf } from './scope-table-of';
import type { ItemId } from '@rotp/game-data';
import type { LocationKey } from '../location-key.type';

const NPC_SCOPE_LOCATIONS: ReadonlyMap<LocationKey, ItemId> = scopeTableOf('npc');

const WORLD_ITEM_SCOPE_LOCATIONS: ReadonlyMap<LocationKey, ItemId> = scopeTableOf('world-item');

const KEY_DROP_LOCATIONS: ReadonlyMap<LocationKey, ItemId> = new Map(scopeRowsOf(scopedChecks('key-drop')));

const CAPACITY_UPGRADE_LOCATIONS: ReadonlyMap<LocationKey, ItemId> = new Map(scopeRowsOf(scopedChecks('capacity')));

const PRIZE_LOCATIONS: ReadonlySet<LocationKey> = new Set(
  all('check').filter((check) => check.kind === 'prize').map((check) => check.id),
);

const VANILLA_PRIZES: ReadonlyMap<LocationKey, ItemId> = new Map(
  scopeRowsOf(all('check').filter((check) => check.kind === 'prize')),
);

export {
  CAPACITY_UPGRADE_LOCATIONS, KEY_DROP_LOCATIONS, NPC_SCOPE_LOCATIONS, PRIZE_LOCATIONS, VANILLA_PRIZES,
  WORLD_ITEM_SCOPE_LOCATIONS,
};
