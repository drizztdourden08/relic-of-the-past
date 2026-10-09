/* @layer shared-game @kind logic */
import { CAPACITY_UPGRADE_LOCATIONS } from '../../scope-tables';
import { isCapacitySpotPresent } from './is-capacity-spot-present';
import type { LocationKey } from '../../location-key';
import type { CapacityProfile } from '../capacity-profile.type';

const presentCapacitySpots = (profile: CapacityProfile): LocationKey[] =>
  [...CAPACITY_UPGRADE_LOCATIONS.keys()].filter((location) => isCapacitySpotPresent(profile, location));

export { presentCapacitySpots };
