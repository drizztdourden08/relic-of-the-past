/* @layer renderer-lib @kind logic */
import type { PoolListingGroup } from '@app/compounds/PoolListing';
import { POOL_PARTITION_IDS } from './starting-weapon-group.constants';

const withStartingWeaponGroup = (
  groups: readonly PoolListingGroup[], group: PoolListingGroup,
): PoolListingGroup[] => {
  const index = groups.findIndex((entry) => !POOL_PARTITION_IDS.has(entry.id));
  const at = index === -1 ? groups.length : index;
  return [...groups.slice(0, at), group, ...groups.slice(at)];
};

export { withStartingWeaponGroup };
