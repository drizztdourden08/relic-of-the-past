/* @layer bridge-wasm @kind logic */
import { computePlacementReach } from '../../placement-availability';
import { BIG_KEY_ITEMS } from '../../world/big-keys';
import { fullKeyRing } from '../../world/small-keys';
import { screensOfRegions } from '@rotp/game-data';
import { locationKeyOfCheck } from '../../world/location-record';
import { completedLocationKeys } from '../check-names';
import { VIRTUAL_PREFIX, virtualLocationOf } from '../virtual-locations';
import type { ItemKey } from '../../world/item-ids';
import type { LocationKey } from '../../world/location-key';
import type { Placement } from '../../world/fill/placement.type';
import type { CheckId, CheckRecord, ItemId, CheckStatus } from '@rotp/game-data';
import type { TrackerReading } from './tracker-availability.type';

const trackerReading = (
  placement: Placement,
  completedChecks: ReadonlySet<CheckId>,
  checks: readonly CheckRecord[],
  firedLocationKeys: ReadonlySet<LocationKey> = new Set(),
  darkRoomsNeedLight = true,
  heldItemIds: ReadonlySet<ItemId> = new Set(),
  bigKeyDoors = true,
  smallKeyDoors = true,
): TrackerReading => {
  const completedLocations = completedLocationKeys(completedChecks, firedLocationKeys);

  const held: ItemKey[] = [...heldItemIds];
  if (!bigKeyDoors) held.push(...BIG_KEY_ITEMS);
  if (!smallKeyDoors) held.push(...fullKeyRing());
  const { available, reachableRegions } = computePlacementReach(
    placement, completedLocations, darkRoomsNeedLight, held, completedChecks,
  );

  const snapshot = new Map<CheckId, CheckStatus>();
  for (const check of checks) {
    const isVirtual = check.id.startsWith(VIRTUAL_PREFIX);
    if (!isVirtual && completedChecks.has(check.id)) {
      snapshot.set(check.id, 'completed');
      continue;
    }
    const location = isVirtual ? virtualLocationOf(check.id) : locationKeyOfCheck(check.id);
    if (completedLocations.has(location)) {
      snapshot.set(check.id, 'completed');
      continue;
    }
    snapshot.set(check.id, available.has(location) ? 'reachable' : 'blocked');
  }
  return { statuses: snapshot, reachableScreens: screensOfRegions(reachableRegions) };
};

export { trackerReading };
