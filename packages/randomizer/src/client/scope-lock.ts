/* @layer bridge-wasm @kind logic */
import {
  KEY_DROP_LOCATIONS, NPC_SCOPE_LOCATIONS, PRIZE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS,
} from '../world/scope-tables';
import type { LocationKey } from '../world/location-key';
import type { ScopeFlags } from './scope-lock.type';

const isScopeLocked = (location: LocationKey, flags: ScopeFlags): boolean =>
  flags.pondPrizeSlots?.has(location) !== true && (
    (!flags.includeNpcChecks && NPC_SCOPE_LOCATIONS.has(location))
    || (!flags.includeWorldItems && WORLD_ITEM_SCOPE_LOCATIONS.has(location))
    || flags.npcLockedLocations?.has(location) === true
    || flags.worldLockedLocations?.has(location) === true);

const isLockedVanilla = (location: LocationKey, flags: ScopeFlags): boolean =>
  (!flags.shufflePrizes && PRIZE_LOCATIONS.has(location))
  || (!flags.keyDropShuffle && KEY_DROP_LOCATIONS.has(location))
  || isScopeLocked(location, flags)
  || flags.capacityLockedLocations?.has(location) === true
  || flags.pondLockedItems?.has(location) === true;

export { isLockedVanilla };
export type { ScopeFlags } from './scope-lock.type';
