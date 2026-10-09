/* @layer shared-game @kind logic */
import { presentCapacitySpots } from '../../capacity/capacity-spots';
import { CAPACITY_POND, POND_INSTANCES } from '../pond-instances';
import { pondCertifiedSpotsOf } from './pond-certified-spots-of';
import { presentRungsOf } from './present-rungs-of';
import type { LocationKey } from '../../location-key';
import type { CapacityProfile } from '../../capacity/capacity-profile.type';
import type { PondInstance } from '../pond-instance.type';
import type { PondSetting } from '../pond-profile.type';
import type { PondProfiles } from '../pond-profiles.type';

const pondSlotsOf = (
  setting: PondSetting, pond: PondInstance, capacity: CapacityProfile,
  deliverable: ReadonlySet<LocationKey> | undefined,
): readonly LocationKey[] => {
  const rungs = presentRungsOf(setting, pond, deliverable);
  if (pond.id === CAPACITY_POND.id) {
    return setting.mode === 'capacity' ? presentCapacitySpots(capacity) : rungs;
  }
  return rungs.length > 0 ? rungs : pondCertifiedSpotsOf(pond);
};

const presentPondSlots = (
  profiles: PondProfiles, capacity: CapacityProfile, deliverable: ReadonlySet<LocationKey> | undefined,
): LocationKey[] =>
  POND_INSTANCES.flatMap((pond) => [...pondSlotsOf(profiles[pond.id], pond, capacity, deliverable)]);

export { presentPondSlots };
