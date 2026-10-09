/* @layer shared-game @kind logic */
import { spotOfFamily } from '../../capacity/capacity-spots';
import type { LocationKey } from '../../location-key';
import type { CapacityProfile } from '../../capacity/capacity-profile.type';

const checkSpotCount = (
  capacity: CapacityProfile, pondLocations: readonly LocationKey[],
  lockedCapacity: ReadonlySet<LocationKey>, lockedScope: ReadonlySet<LocationKey>,
): number => {
  const pond = pondLocations.filter((key) => !lockedCapacity.has(key)).length;
  const meterSpot = spotOfFamily('meter');
  const meterGiverIsCheck = meterSpot !== undefined && capacity.meter.mode !== 'vanilla' && !lockedScope.has(meterSpot);
  return pond + (meterGiverIsCheck ? 1 : 0);
};

export { checkSpotCount };
