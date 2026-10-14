/* @layer shared-game @kind logic */
import {
  CAPACITY_UPGRADE_LOCATIONS, KEY_DROP_LOCATIONS, NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS,
} from '../../scope-tables';
import type { ItemKey } from '../../item-ids';
import type { LocationKey } from '../../location-key';
import type { LockedVanillaInput } from './locked-inputs.type';

const lockScopeTables = (lockedScope: ReadonlySet<LocationKey>, into: Map<LocationKey, ItemKey>): void => {
  for (const [location, item] of NPC_SCOPE_LOCATIONS) {
    if (lockedScope.has(location)) into.set(location, item);
  }
  for (const [location, item] of WORLD_ITEM_SCOPE_LOCATIONS) {
    if (lockedScope.has(location)) into.set(location, item);
  }
};

const lockedVanillaOf = (input: LockedVanillaInput): Map<LocationKey, ItemKey> => {
  const { world, keyDropShuffle, lockedScope, lockedPondGrants, lockedCapacity } = input;
  const lockedVanilla = new Map<LocationKey, ItemKey>();
  if (!keyDropShuffle) {
    for (const [location, item] of KEY_DROP_LOCATIONS) lockedVanilla.set(location, item);
  }
  lockScopeTables(lockedScope, lockedVanilla);
  for (const [location, item] of lockedPondGrants) lockedVanilla.set(location, item);
  for (const [location, item] of CAPACITY_UPGRADE_LOCATIONS) {
    if (lockedCapacity.has(location) && world.locationsByKey.has(location)) lockedVanilla.set(location, item);
  }
  return lockedVanilla;
};

export { lockedVanillaOf };
