/* @layer shared-game @kind logic */
import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from '../../scope-tables';
import type { LocationKey } from '../../location-key';

const defaultLockedScope = (includeNpcChecks: boolean, includeWorldItems: boolean): ReadonlySet<LocationKey> => {
  const locked = new Set<LocationKey>();
  if (!includeNpcChecks) for (const key of NPC_SCOPE_LOCATIONS.keys()) locked.add(key);
  if (!includeWorldItems) for (const key of WORLD_ITEM_SCOPE_LOCATIONS.keys()) locked.add(key);
  return locked;
};

export { defaultLockedScope };
