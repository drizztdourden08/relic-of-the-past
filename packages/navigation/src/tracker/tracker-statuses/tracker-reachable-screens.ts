/* @layer renderer-lib @kind logic */
import { trackerReading } from '@rotp/randomizer';
import type { LocationKey } from '@rotp/randomizer';
import type { TrackerStatusParams } from './tracker-statuses.type';

const trackerReachableScreens = (params: TrackerStatusParams): Set<string> => {
  const {
    placement, checks, inventory, completed,
    fired = new Set<LocationKey>(), darkRoomsNeedLight = true, bigKeyDoors = true, smallKeyDoors = true,
  } = params;
  return trackerReading(
    placement, completed, checks, fired, darkRoomsNeedLight, inventory, bigKeyDoors, smallKeyDoors,
  ).reachableScreens;
};

export { trackerReachableScreens };
