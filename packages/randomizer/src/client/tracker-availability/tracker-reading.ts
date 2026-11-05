/* @layer bridge-wasm @kind logic */
import { readPlacement } from '../../placement-availability';
import { completedLocationKeys } from '../check-names';
import { checkStatusesOf } from './check-statuses-of';
import type { TrackerReading, TrackerReadingRequest } from './tracker-availability.type';

const trackerReading = (request: TrackerReadingRequest): TrackerReading => {
  const {
    placement, completedChecks, checks, firedLocationKeys = new Set(), darkRoomsNeedLight = true,
    heldItemIds = new Set(), bigKeyDoors = true, smallKeyDoors = true,
  } = request;
  const completedLocations = completedLocationKeys(completedChecks, firedLocationKeys);
  const reading = readPlacement({
    placement, completedLocations, completedCheckIds: completedChecks, heldItems: heldItemIds,
    darkRoomsNeedLight, bigKeyDoors, smallKeyDoors,
  });
  return checkStatusesOf(reading, { checks, completedChecks, completedLocations });
};

export { trackerReading };
