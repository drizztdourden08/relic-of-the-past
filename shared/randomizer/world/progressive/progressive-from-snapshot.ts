/* @layer shared-game @kind logic */
/**
 * The tier rows ⇄ the setting they stand for, both directions in one file so
 * the reading the generator uses and the writing the creation form freezes can
 * never spell the same option two ways, the dark-room module's contract.
 *
 * An absent key falls back to its default tick (every rung, but the ocarina's second, which
 * puts the Activated Flute in the pool and is off): the reference pool.
 */
import { DEFAULT_PROGRESSIVE_SETTING, PROGRESSIVE_FAMILIES } from './progressive-families.data';
import { progressiveTierKeyOf } from './progressive-option-keys';
import type { OptionValue, RandomizerOptionsSnapshot } from '../options.type';
import type { ProgressiveFamilyId, ProgressiveSetting, ProgressiveTierTicks } from './progressive.type';

type Values = Readonly<Record<string, OptionValue>>;

/** A tier's default tick: every rung, but the ocarina's second (progressive-families.data.ts). */
const defaultTickOf = (family: ProgressiveFamilyId, index: number): boolean =>
  DEFAULT_PROGRESSIVE_SETTING[family][index] ?? true;

const tickOf = (values: Values, key: string, fallback: boolean): boolean =>
  (typeof values[key] === 'boolean' ? values[key] : fallback);

const progressiveSettingOfValues = (values: Values): ProgressiveSetting =>
  Object.fromEntries(PROGRESSIVE_FAMILIES.map((family) => [
    family.id,
    family.tiers.map((_tier, index) =>
      tickOf(values, progressiveTierKeyOf(family.id, index), defaultTickOf(family.id, index))),
  ])) as unknown as ProgressiveSetting;

const progressiveSettingFromSnapshot = (snapshot: RandomizerOptionsSnapshot): ProgressiveSetting =>
  progressiveSettingOfValues(snapshot.values);

/** The rows a setting freezes: what the creation form hands the catalog. */
const progressiveValuesOf = (setting: ProgressiveSetting): Record<string, OptionValue> =>
  Object.fromEntries(PROGRESSIVE_FAMILIES.flatMap((family) =>
    family.tiers.map((_tier, index): [string, OptionValue] => [
      progressiveTierKeyOf(family.id, index),
      setting[family.id][index] ?? defaultTickOf(family.id, index),
    ])));

/** True while every family is at its default ticks: the reference pool. */
const isReferenceProgressiveSetting = (setting: ProgressiveSetting): boolean =>
  PROGRESSIVE_FAMILIES.every((family) => family.tiers.every((_tier, index) =>
    (setting[family.id][index] ?? defaultTickOf(family.id, index)) === defaultTickOf(family.id, index)));

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
