/* @layer shared-game @kind logic */
/**
 * The mode rows ⇄ the setting they stand for, both directions in one file so
 * the reading the generator uses and the writing the creation form freezes can
 * never spell the same option two ways — the same contract the tier ticks and
 * the dark-room rows keep.
 *
 * A snapshot frozen before these rows existed carries none of them, and an
 * absent key falls back to the in-order reading. That is the pool every stored
 * placement was generated under, so an old profile keeps playing exactly as it
 * was rolled.
 */
import { PROGRESSIVE_FAMILIES } from './progressive-families.data';
import { progressiveModeKeyOf } from './progressive-mode-keys';
import type { ApOptionValue, RandomizerOptionsSnapshot } from '../options.type';
import type { ProgressiveFamilyMode, ProgressiveModeSetting } from './progressive.type';

type Values = Readonly<Record<string, ApOptionValue>>;

/** Anything that is not the one recognised alternative reads as the reference. */
const modeAt = (values: Values, key: string): ProgressiveFamilyMode =>
  (values[key] === 'random' ? 'random' : 'progressive');

const progressiveModesOfValues = (values: Values): ProgressiveModeSetting =>
  Object.fromEntries(PROGRESSIVE_FAMILIES.map((family) => [
    family.id, modeAt(values, progressiveModeKeyOf(family.id)),
  ])) as unknown as ProgressiveModeSetting;

const progressiveModesFromSnapshot = (snapshot: RandomizerOptionsSnapshot): ProgressiveModeSetting =>
  progressiveModesOfValues(snapshot.values);

/**
 * The rows a setting freezes — what the creation form hands the catalog.
 *
 * A family the setting says nothing about writes its key with NOTHING behind
 * it rather than with the default. That is deliberate: the wiring guard reads
 * the frozen map by value, so a mode field left off the choices has to show up
 * as an unwired row there rather than quietly freezing as the reference
 * reading. Absent on the way BACK IN is what means "in order"
 * (progressiveModesOfValues above), and that is the only place it should mean
 * anything.
 */
const progressiveModeValuesOf = (modes: ProgressiveModeSetting): Record<string, ApOptionValue> =>
  Object.fromEntries(PROGRESSIVE_FAMILIES.map((family): [string, ApOptionValue] => [
    progressiveModeKeyOf(family.id),
    modes?.[family.id] as ApOptionValue,
  ]));

export { progressiveModeValuesOf, progressiveModesFromSnapshot, progressiveModesOfValues };
