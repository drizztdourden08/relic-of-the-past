/* @layer shared-game @kind types */
/**
 * The pickup bonus of a capacity family: what a capacity upgrade hands over
 * beside the ceiling it raises. A percentage, and what it is a percentage
 * OF: the new maximum, or, with the step base on, only the capacity this
 * pickup gained. The core adds the amount to the counter and clamps it at
 * the new maximum; at 0 only the ceiling rises.
 */
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';

interface FamilyBonus {
  /** 0 to 100, in the catalog's step. */
  percent: number;
  /** True: a share of the capacity gained by the pickup. False: of the new maximum. */
  stepBase: boolean;
}

type CapacityBonusSetting = Readonly<Record<CapacityFamilyId, FamilyBonus>>;

export type { CapacityBonusSetting, FamilyBonus };
