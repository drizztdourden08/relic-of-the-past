/* @layer shared-game @kind logic */
import { FAMILY_BY_ID } from './capacity-families.constants';
import type { CapacityFamilyId } from '../capacity-profile.type';
import type { CapacityFamily } from './capacity-family.type';

const familyById = (id: CapacityFamilyId): CapacityFamily => FAMILY_BY_ID[id];

export { familyById };
