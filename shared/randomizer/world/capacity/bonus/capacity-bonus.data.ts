/* @layer shared-game @kind data */
/**
 * The catalog keys of the eight pickup-bonus rows (one percentage and one
 * base switch per family) and the two settings that anchor them. LEGACY
 * reproduces what a pickup handed over before the rows existed: the pond
 * arithmetic refilled a counted family to its new cap (100 of the ceiling),
 * the meter's borrowed refill gave 16 of the 128 bar (15 of the ceiling, the
 * nearest step), and the wallet's borrowed receipt a flat fifty, which is
 * half of every hundred-rupee rung climbed (50 of the step). It is what an
 * absent row, and a placement without the setting, still mean. DEFAULT is
 * where a NEW profile starts: a quarter of each counted step, the meter
 * refilled whole, and nothing beside a wallet rung.
 */
import { CAPACITY_FAMILY_IDS } from '@shared/game/data/capacity-upgrade-names.data';
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';
import type { CapacityBonusSetting, FamilyBonus } from './capacity-bonus.type';

/** The slider's stride: fine enough to say "a quarter", coarse enough to land on it. */
const CAPACITY_BONUS_STEP = 5;
const CAPACITY_BONUS_MAX = 100;

const capacityBonusKeyOf = (family: CapacityFamilyId): string => `capacity_${family}_bonus`;
const capacityBonusBaseKeyOf = (family: CapacityFamilyId): string => `capacity_${family}_bonus_step`;

const CAPACITY_BONUS_KEYS: readonly string[] = CAPACITY_FAMILY_IDS.flatMap((family) =>
  [capacityBonusKeyOf(family), capacityBonusBaseKeyOf(family)]);

const isCapacityBonusKey = (key: string): boolean => CAPACITY_BONUS_KEYS.includes(key);

const LEGACY_CAPACITY_BONUS: CapacityBonusSetting = {
  explosives: { percent: 100, stepBase: false },
  projectiles: { percent: 100, stepBase: false },
  meter: { percent: 15, stepBase: false },
  wallet: { percent: 50, stepBase: true },
};

const DEFAULT_CAPACITY_BONUS: CapacityBonusSetting = {
  explosives: { percent: 25, stepBase: true },
  projectiles: { percent: 25, stepBase: true },
  meter: { percent: 100, stepBase: false },
  wallet: { percent: 0, stepBase: true },
};

/** A percentage snapped onto the slider's stride and held to 0..100. */
const clampBonusPercent = (percent: number): number => {
  if (!Number.isFinite(percent)) return 0;
  const snapped = Math.round(percent / CAPACITY_BONUS_STEP) * CAPACITY_BONUS_STEP;
  return Math.max(0, Math.min(CAPACITY_BONUS_MAX, snapped));
};

const defaultFamilyBonus = (family: CapacityFamilyId): FamilyBonus => DEFAULT_CAPACITY_BONUS[family];

export {
  CAPACITY_BONUS_KEYS, CAPACITY_BONUS_MAX, CAPACITY_BONUS_STEP, DEFAULT_CAPACITY_BONUS, LEGACY_CAPACITY_BONUS,
  capacityBonusBaseKeyOf, capacityBonusKeyOf, clampBonusPercent, defaultFamilyBonus, isCapacityBonusKey,
};
