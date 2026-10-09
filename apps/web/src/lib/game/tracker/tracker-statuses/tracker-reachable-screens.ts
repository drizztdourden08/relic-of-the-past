/* @layer renderer-lib @kind logic */
import { trackerReading } from '../../randomizer-client/tracker-availability';
import type { LocationKey } from '@shared/randomizer/world/location-key';
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
