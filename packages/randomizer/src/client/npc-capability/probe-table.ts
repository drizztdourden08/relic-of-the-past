/* @layer bridge-wasm @kind logic */
import type { ItemId } from '@rotp/game-data';
import type { LocationKey } from '../../world/location-key';
import { isDeliverable } from './is-deliverable';

const probeTable = (table: ReadonlyMap<LocationKey, ItemId>): ReadonlySet<LocationKey> => {
  const deliverable = new Set<LocationKey>();
  for (const [location, vanillaItem] of table) {
    if (isDeliverable(location, vanillaItem)) deliverable.add(location);
  }
  return deliverable;
};

export { probeTable };
