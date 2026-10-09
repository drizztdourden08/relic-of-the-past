/* @layer shared-game @kind logic */
import { presentCapacitySpots } from '../../capacity/capacity-spots';
import { CAPACITY_POND, POND_INSTANCES } from '../pond-instances';
import { presentRungsOf } from './present-rungs-of';
import type { LocationKey } from '../../location-key';
import type { CapacityProfile } from '../../capacity/capacity-profile.type';
import type { PondProfiles } from '../pond-profiles.type';

const pondPrizeLocations = (
  profiles: PondProfiles, capacity: CapacityProfile, deliverable: ReadonlySet<LocationKey> | undefined,
): LocationKey[] => {
  const legacyCapacityPond = profiles[CAPACITY_POND.id].mode === 'capacity';
  const rungs = POND_INSTANCES.flatMap((pond) => presentRungsOf(profiles[pond.id], pond, deliverable));
  return legacyCapacityPond ? [...presentCapacitySpots(capacity), ...rungs] : rungs;
};

export { pondPrizeLocations };
