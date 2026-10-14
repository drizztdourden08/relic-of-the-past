/* @layer bridge-wasm @kind logic */
import { trackerReading } from './tracker-reading';
import type { CheckId, CheckStatus } from '@rotp/game-data';
import type { TrackerSnapshotArgs } from './tracker-availability.type';

const computeTrackerSnapshot = (...args: TrackerSnapshotArgs): Map<CheckId, CheckStatus> => {
  const [placement, completedChecks, checks, firedLocationKeys, darkRoomsNeedLight, heldItemIds, bigKeyDoors, smallKeyDoors] = args;
  return trackerReading({
    placement, completedChecks, checks, firedLocationKeys, darkRoomsNeedLight, heldItemIds, bigKeyDoors, smallKeyDoors,
  }).statuses;
};

export { computeTrackerSnapshot };
