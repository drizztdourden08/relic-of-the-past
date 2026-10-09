/* @layer shared-game @kind logic */
import { CAPACITY_PROGRESSIVE_NAMES } from '../capacity-upgrade-names.constants';
import type { CapacityFamilyId } from '../capacity-family.type';

const progressiveCapacityItemName = (family: CapacityFamilyId): string => CAPACITY_PROGRESSIVE_NAMES[family];

export { progressiveCapacityItemName };
