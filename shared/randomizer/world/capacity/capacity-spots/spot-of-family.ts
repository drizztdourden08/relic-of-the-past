/* @layer shared-game @kind logic */
import { capacitySpots } from './capacity-spots';
import type { LocationKey } from '../../location-key';
import type { CapacityFamilyId } from '../capacity-profile.type';

const spotOfFamily = (family: CapacityFamilyId): LocationKey | undefined => capacitySpots().get(family);

export { spotOfFamily };
