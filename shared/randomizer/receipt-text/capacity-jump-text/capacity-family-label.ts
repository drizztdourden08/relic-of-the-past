/* @layer shared-game @kind logic */
import { familyById } from '../../world/capacity/capacity-family';
import type { CapacityFamilyId } from '@rotp/game-data';

const capacityFamilyLabel = (family: CapacityFamilyId): string => familyById(family).label;

export { capacityFamilyLabel };
