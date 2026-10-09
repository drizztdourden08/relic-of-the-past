/* @layer bridge-wasm @kind constants */
import type { ItemId } from '@rotp/game-data';
import type { LocationKey } from '../../world/location-key';
import { CAPACITY_UPGRADE_LOCATIONS, NPC_SCOPE_LOCATIONS } from '../../world/scope-tables';
import { POND_INSTANCES } from '../../world/pond/pond-instances';

const POND_SLOT_LOCATIONS: ReadonlyMap<LocationKey, ItemId> = new Map(
  POND_INSTANCES.flatMap((pond) => pond.slots.flatMap((slot) => {
    const vanillaItem = CAPACITY_UPGRADE_LOCATIONS.get(slot.key)
      ?? NPC_SCOPE_LOCATIONS.get(slot.key);
    return vanillaItem === undefined ? [] : [[slot.key, vanillaItem] as [LocationKey, ItemId]];
  })),
);

export { POND_SLOT_LOCATIONS };
