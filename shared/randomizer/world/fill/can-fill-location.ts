/* @layer shared-game @kind logic */
import { canCollectLocation } from '../rules/collect';
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';
import type { CollectionState } from '../collection-state';

const canFillLocation = (
  state: CollectionState, location: LocationKey, item: ItemKey, checkAccess = true,
): boolean => {
  const { world } = state;
  if (!world.getItemRule(location)(item)) return false;
  const allow = world.alwaysAllow.get(location);
  if (allow !== undefined && allow(state, item)) return true;
  return !checkAccess || canCollectLocation(state, location);
};

export { canFillLocation };
