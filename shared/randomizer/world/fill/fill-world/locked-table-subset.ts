/* @layer shared-game @kind logic */
import type { ItemId } from '@shared/game/data/types/ids';
import type { LocationKey } from '../../location-key';

const lockedTableSubset = (
  table: ReadonlyMap<LocationKey, ItemId>, include: boolean,
  deliverable: ReadonlySet<string> | undefined, into: Set<LocationKey>,
): void => {
  for (const key of table.keys()) {
    if (!include || (deliverable !== undefined && !deliverable.has(key))) into.add(key);
  }
};

export { lockedTableSubset };
