/* @layer shared-game @kind logic */
import { CAPACITY_FAMILY_IDS } from '@rotp/game-data';
import { optionNumberOf } from '../option-number-of';
import { DEFAULT_CAPACITY_BONUS } from './capacity-bonus.data';
import { capacityBonusBaseKeyOf } from './capacity-bonus-base-key-of';
import { capacityBonusKeyOf } from './capacity-bonus-key-of';
import { clampBonusPercent } from './clamp-bonus-percent';
import type { CapacityFamilyId } from '@rotp/game-data';
import type { OptionValue, PartialOptionValues } from '../../options.type';
import type { CapacityBonusSetting, FamilyBonus } from './capacity-bonus.type';

const percentOf = (raw: OptionValue | undefined, fallback: number): number => {
  const value = optionNumberOf(raw);
  return Number.isFinite(value) ? clampBonusPercent(value) : fallback;
};

const familyBonusOf = (values: PartialOptionValues, family: CapacityFamilyId): FamilyBonus => {
  const fallback = DEFAULT_CAPACITY_BONUS[family];
  const stepBase = values[capacityBonusBaseKeyOf(family)];
  return {
    percent: percentOf(values[capacityBonusKeyOf(family)], fallback.percent),
    stepBase: typeof stepBase === 'boolean' ? stepBase : fallback.stepBase,
  };
};

const capacityBonusOfValues = (values: PartialOptionValues): CapacityBonusSetting => Object.fromEntries(
  CAPACITY_FAMILY_IDS.map((family) => [family, familyBonusOf(values, family)]),
) as Record<CapacityFamilyId, FamilyBonus>;

export { capacityBonusOfValues };
