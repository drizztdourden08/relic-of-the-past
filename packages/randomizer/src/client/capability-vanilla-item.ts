/* @layer bridge-wasm @kind logic */
import {
  CAPACITY_UPGRADE_LOCATIONS, NPC_SCOPE_LOCATIONS, PRIZE_LOCATIONS, VANILLA_PRIZES, WORLD_ITEM_SCOPE_LOCATIONS,
} from '../world/scope-tables';
import type { ItemKey } from '../world/item-ids.data';
import type { LocationKey } from '../world/location-key';
import type { ScopeFlags } from './scope-lock.type';

const capabilityVanillaItemOf = (location: LocationKey, flags: ScopeFlags): ItemKey | undefined => {
  if (!flags.shufflePrizes && PRIZE_LOCATIONS.has(location)) return VANILLA_PRIZES.get(location);
  const pondItem = flags.pondLockedItems?.get(location);
  if (pondItem !== undefined) return pondItem;
  if (flags.npcLockedLocations?.has(location) === true) {
    return NPC_SCOPE_LOCATIONS.get(location);
  }
  if (flags.worldLockedLocations?.has(location) === true) {
    return WORLD_ITEM_SCOPE_LOCATIONS.get(location);
  }
  if (flags.capacityLockedLocations?.has(location) === true) {
    return CAPACITY_UPGRADE_LOCATIONS.get(location) ?? NPC_SCOPE_LOCATIONS.get(location);
  }
  return undefined;
};

export { capabilityVanillaItemOf };
