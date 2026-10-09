/* @layer shared-game @kind logic */
import { capacitySpots } from './capacity-spots';
import type { LocationKey } from '../../location-key';
import type { CapacityFamilyId } from '../capacity-profile.type';

const familyOfSpot = (location: LocationKey): CapacityFamilyId | undefined => {
  for (const [family, spot] of capacitySpots()) if (spot === location) return family;
  return undefined;
};

export { familyOfSpot };
