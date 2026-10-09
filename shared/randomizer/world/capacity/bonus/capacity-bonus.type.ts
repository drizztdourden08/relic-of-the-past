/* @layer shared-game @kind types */
import type { CapacityFamilyId } from '@rotp/game-data';

interface FamilyBonus {
  percent: number;
  stepBase: boolean;
}

type CapacityBonusSetting = Readonly<Record<CapacityFamilyId, FamilyBonus>>;

export type { CapacityBonusSetting, FamilyBonus };
