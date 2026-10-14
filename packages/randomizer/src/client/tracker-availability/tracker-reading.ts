/* @layer bridge-wasm @kind logic */
import { computePlacementReach } from '../../placement-availability';
import { BIG_KEY_ITEMS } from '../../world/big-keys';
import { fullKeyRing } from '../../world/small-keys';
import { screensOfRegions } from '@rotp/game-data';
import { locationKeyOfCheck } from '../../world/location-record';
import { completedLocationKeys } from '../check-names';
import { VIRTUAL_PREFIX, virtualLocationOf } from '../virtual-locations';
import type { ItemKey } from '../../world/item-ids';
import type { CheckRecord, CheckStatus } from '@rotp/game-data';
import type { StatusInputs, TrackerReading, TrackerReadingRequest } from './tracker-availability.type';

const statusOf = (check: CheckRecord, seen: StatusInputs): CheckStatus => {
  const isVirtual = check.id.startsWith(VIRTUAL_PREFIX);
  if (!isVirtual && seen.completedChecks.has(check.id)) return 'completed';
  const location = isVirtual ? virtualLocationOf(check.id) : locationKeyOfCheck(check.id);
  if (seen.completedLocations.has(location)) return 'completed';
  return seen.available.has(location) ? 'reachable' : 'blocked';
};

const trackerReading = (request: TrackerReadingRequest): TrackerReading => {
  const {
    placement, completedChecks, checks, firedLocationKeys = new Set(), darkRoomsNeedLight = true,
    heldItemIds = new Set(), bigKeyDoors = true, smallKeyDoors = true,
  } = request;
  const completedLocations = completedLocationKeys(completedChecks, firedLocationKeys);

  const held: ItemKey[] = [...heldItemIds];
  if (!bigKeyDoors) held.push(...BIG_KEY_ITEMS);
  if (!smallKeyDoors) held.push(...fullKeyRing());
  const { available, reachableRegions } = computePlacementReach({
    placement, completedLocations, darkRoomsNeedLight, heldItems: held, completedCheckIds: completedChecks,
  });

  const seen: StatusInputs = { completedChecks, completedLocations, available };
  const statuses = new Map(checks.map((check) => [check.id, statusOf(check, seen)]));
  return { statuses, reachableScreens: screensOfRegions(reachableRegions) };
};

export { trackerReading };
