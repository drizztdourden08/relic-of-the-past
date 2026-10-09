/* @layer shared-game @kind logic */
import { familyById } from '../../world/capacity/capacity-family';
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';

const capacityFamilyLabel = (family: CapacityFamilyId): string => familyById(family).label;

export { capacityFamilyLabel };
