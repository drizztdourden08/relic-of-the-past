/* @layer shared-game @kind logic */
/**
 * The pickup-bonus rows ⇄ the setting they stand for, both directions in one
 * file so the reading a session arms and the writing the creation form
 * freezes can never spell the same option two ways. A snapshot frozen before
 * these rows existed carries none of them, and an absent key falls back to
 * the family's legacy bonus, which reproduces what a pickup handed over then.
 */
import { CAPACITY_FAMILY_IDS } from '@shared/game/data/capacity-upgrade-names.data';
import {
  LEGACY_CAPACITY_BONUS, capacityBonusBaseKeyOf, capacityBonusKeyOf, clampBonusPercent,
} from './capacity-bonus.data';
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';
import type { ApOptionValue, RandomizerOptionsSnapshot } from '../../options.type';
import type { CapacityBonusSetting, FamilyBonus } from './capacity-bonus.type';

type Values = Readonly<Record<string, ApOptionValue | undefined>>;

const percentOf = (raw: ApOptionValue | undefined, fallback: number): number => {
  const value = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : Number.NaN;
  return Number.isFinite(value) ? clampBonusPercent(value) : fallback;
};

const familyBonusOf = (values: Values, family: CapacityFamilyId): FamilyBonus => {
  const fallback = LEGACY_CAPACITY_BONUS[family];
  const stepBase = values[capacityBonusBaseKeyOf(family)];
  return {
    percent: percentOf(values[capacityBonusKeyOf(family)], fallback.percent),
    stepBase: typeof stepBase === 'boolean' ? stepBase : fallback.stepBase,
  };
};

const capacityBonusOfValues = (values: Values): CapacityBonusSetting => Object.fromEntries(
  CAPACITY_FAMILY_IDS.map((family) => [family, familyBonusOf(values, family)]),
) as Record<CapacityFamilyId, FamilyBonus>;

const capacityBonusFromSnapshot = (snapshot: RandomizerOptionsSnapshot): CapacityBonusSetting =>
  capacityBonusOfValues(snapshot.values);

/** The rows a setting freezes — what the creation form hands the catalog. */
const capacityBonusValuesOf = (setting: CapacityBonusSetting): Record<string, ApOptionValue> => {
  const values: Record<string, ApOptionValue> = {};
  for (const family of CAPACITY_FAMILY_IDS) {
    values[capacityBonusKeyOf(family)] = clampBonusPercent(setting[family].percent);
    values[capacityBonusBaseKeyOf(family)] = setting[family].stepBase;
  }
  return values;
};

export { capacityBonusFromSnapshot, capacityBonusOfValues, capacityBonusValuesOf };
