/* @layer shared-game @kind types */
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';

interface FamilyBonus {
  percent: number;
  stepBase: boolean;
}

type CapacityBonusSetting = Readonly<Record<CapacityFamilyId, FamilyBonus>>;

export type { CapacityBonusSetting, FamilyBonus };
