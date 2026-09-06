/* @layer shared-game @kind logic */
/**
 * The tier rows ⇄ the setting they stand for, both directions in one file so
 * the reading the generator uses and the writing the creation form freezes can
 * never spell the same option two ways — the dark-room module's contract.
 *
 * A snapshot frozen before these rows existed carries none of them, and an
 * absent key falls back to TICKED. That is the reference pool every stored
 * placement was generated under, so an old profile keeps playing exactly as it
 * was rolled.
 */
import { DEFAULT_PROGRESSIVE_SETTING, PROGRESSIVE_FAMILIES } from './progressive-families.data';
import { progressiveTierKeyOf } from './progressive-option-keys';
import type { ApOptionValue, RandomizerOptionsSnapshot } from '../options.type';
import type { ProgressiveSetting, ProgressiveTierTicks } from './progressive.type';

type Values = Readonly<Record<string, ApOptionValue>>;

const tickOf = (values: Values, key: string): boolean =>
  (typeof values[key] === 'boolean' ? values[key] : true);

const progressiveSettingOfValues = (values: Values): ProgressiveSetting =>
  Object.fromEntries(PROGRESSIVE_FAMILIES.map((family) => [
    family.id,
    family.tiers.map((_tier, index) => tickOf(values, progressiveTierKeyOf(family.id, index))),
  ])) as unknown as ProgressiveSetting;

const progressiveSettingFromSnapshot = (snapshot: RandomizerOptionsSnapshot): ProgressiveSetting =>
  progressiveSettingOfValues(snapshot.values);

/** The rows a setting freezes — what the creation form hands the catalog. */
const progressiveValuesOf = (setting: ProgressiveSetting): Record<string, ApOptionValue> =>
  Object.fromEntries(PROGRESSIVE_FAMILIES.flatMap((family) =>
    family.tiers.map((_tier, index): [string, ApOptionValue] => [
      progressiveTierKeyOf(family.id, index),
      setting[family.id][index] ?? true,
    ])));

/** True while every family still carries every tier — the reference pool. */
const isReferenceProgressiveSetting = (setting: ProgressiveSetting): boolean =>
  PROGRESSIVE_FAMILIES.every((family) =>
    family.tiers.every((_tier, index) => setting[family.id][index] !== false));

/** The default, handed out as a fresh mutable-safe copy for a creation form. */
const defaultProgressiveSetting = (): ProgressiveSetting =>
  Object.fromEntries(PROGRESSIVE_FAMILIES.map((family) => [
    family.id, [...(DEFAULT_PROGRESSIVE_SETTING[family.id] as ProgressiveTierTicks)],
  ])) as unknown as ProgressiveSetting;

export {
  defaultProgressiveSetting,
  isReferenceProgressiveSetting,
  progressiveSettingFromSnapshot,
  progressiveSettingOfValues,
  progressiveValuesOf,
};
