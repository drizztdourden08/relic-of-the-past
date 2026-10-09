/* @layer shared-game @kind logic */
import { CAPACITY_UPGRADE_LOCATIONS } from '../../scope-tables';
import { familyOfSpot } from './family-of-spot';
import type { LocationKey } from '../../location-key';
import type { CapacityProfile } from '../capacity-profile.type';

const isCapacitySpotPresent = (profile: CapacityProfile, location: LocationKey): boolean => {
  const family = familyOfSpot(location);
  return family !== undefined && CAPACITY_UPGRADE_LOCATIONS.has(location)
    && profile[family].mode !== 'vanilla';
};

export { isCapacitySpotPresent };
