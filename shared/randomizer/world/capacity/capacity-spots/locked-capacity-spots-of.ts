/* @layer shared-game @kind logic */
import { presentCapacitySpots } from './present-capacity-spots';
import type { LocationKey } from '../../location-key';
import type { CapacityProfile } from '../capacity-profile.type';

const lockedCapacitySpotsOf = (
  profile: CapacityProfile, deliverable: ReadonlySet<LocationKey> | undefined,
): ReadonlySet<LocationKey> =>
  new Set(presentCapacitySpots(profile).filter((location) => deliverable?.has(location) !== true));

export { lockedCapacitySpotsOf };
