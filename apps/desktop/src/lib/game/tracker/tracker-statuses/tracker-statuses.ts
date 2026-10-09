/* @layer renderer-lib @kind logic */
import { computeRecordStatuses } from '@rotp/game-data';
import { trackerReading } from '../../randomizer-client/tracker-availability';
import { grantedInventory, recordRowOverrides } from '../record-row-inputs';
import { rowsWithoutALocation } from './rows-without-a-location';
import type { CheckId } from '@rotp/game-data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { CheckStatus } from '@rotp/game-data';
import type { TrackerStatusParams } from './tracker-statuses.type';

const trackerStatuses = (params: TrackerStatusParams): Map<CheckId, CheckStatus> => {
  const {
    placement, checks, inventory, completed,
    fired = new Set<LocationKey>(), darkRoomsNeedLight = true, bigKeyDoors = true, smallKeyDoors = true,
  } = params;

  const { statuses, reachableScreens } = trackerReading(
    placement, completed, checks, fired, darkRoomsNeedLight, inventory, bigKeyDoors, smallKeyDoors,
  );
  const fromRecords = computeRecordStatuses({
    inventory: grantedInventory({ placement, inventory, darkRoomsNeedLight, bigKeyDoors }),
    completedChecks: completed,
    checks: rowsWithoutALocation(checks, placement),
    reachableScreens,
    checkOverrides: recordRowOverrides(placement),
  });
  for (const [id, status] of fromRecords) statuses.set(id, status);
  return statuses;
};

export { trackerStatuses };
