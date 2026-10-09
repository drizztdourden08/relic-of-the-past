/* @layer bridge-wasm @kind logic */
import type { ItemId } from '@rotp/game-data';
import type { LocationKey } from '../../world/location-key';

const lockedComplement = (
  table: ReadonlyMap<LocationKey, ItemId>, deliverable: ReadonlySet<LocationKey>,
): ReadonlySet<LocationKey> => {
  const locked = new Set<LocationKey>();
  for (const key of table.keys()) {
    if (!deliverable.has(key)) locked.add(key);
  }
  return locked;
};

export { lockedComplement };
