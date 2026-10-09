/* @layer shared-game @kind types */
import type { CapacityFamilyId } from '../capacity-family.type';

interface CapacityUpgradeItem {
  family: CapacityFamilyId;
  jump: number;
}

export type { CapacityUpgradeItem };
