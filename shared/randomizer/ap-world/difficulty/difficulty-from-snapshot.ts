/* @layer shared-game @kind logic */
/**
 * The difficulty rows ⇄ the setting they stand for, both directions in one
 * file so the reading the generator uses and the writing the creation form
 * freezes can never spell the same option two ways, the contract every other
 * block here keeps.
 *
 * A snapshot frozen before these rows existed carries none of them. Every
 * missing key falls back to the reference pool: one copy per rung, hearts to
 * the game's own ceiling. That is the seed every stored placement was rolled
 * from, so an old profile keeps playing exactly as it was rolled.
 */
import { PROGRESSIVE_FAMILIES } from '../progressive/progressive-families.data';
import {
  DEFAULT_COPY_MULTIPLIER, DEFAULT_DIFFICULTY, DEFAULT_HEART_CAP, asCopyMultiplier, asHeartCap,
} from './difficulty.data';
import { HEART_CAP_KEY, difficultyCopiesKeyOf } from './difficulty-option-keys';
import type { ApOptionValue, RandomizerOptionsSnapshot } from '../options.type';
import type { CopyMultiplier, CopyMultiplierSetting, DifficultySetting } from './difficulty.type';

type Values = Readonly<Record<string, ApOptionValue>>;

const multiplierAt = (values: Values, key: string): CopyMultiplier => {
  const raw = values[key];
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return DEFAULT_COPY_MULTIPLIER;
  return asCopyMultiplier(raw);
};

const copiesOfValues = (values: Values): CopyMultiplierSetting =>
  Object.fromEntries(PROGRESSIVE_FAMILIES.map((family) =>
    [family.id, multiplierAt(values, difficultyCopiesKeyOf(family.id))])) as unknown as CopyMultiplierSetting;

const heartCapOfValues = (values: Values): number => {
  const raw = values[HEART_CAP_KEY];
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return DEFAULT_HEART_CAP;
  return asHeartCap(raw);
};

const difficultyOfValues = (values: Values): DifficultySetting => ({
  copies: copiesOfValues(values),
  heartCap: heartCapOfValues(values),
});

const difficultyFromSnapshot = (snapshot: RandomizerOptionsSnapshot): DifficultySetting =>
  difficultyOfValues(snapshot.values);

/**
 * The rows a setting freezes: what the creation form hands the catalog. A
 * setting the choices never carried writes its keys with nothing behind them
 * instead of with the defaults, for the same reason the retro rows do: the
 * wiring guard reads the frozen map by value and an unwired field has to show
 * there.
 */
const difficultyValuesOf = (setting: DifficultySetting): Record<string, ApOptionValue> => ({
  ...Object.fromEntries(PROGRESSIVE_FAMILIES.map((family): [string, ApOptionValue] =>
    [difficultyCopiesKeyOf(family.id), setting?.copies?.[family.id] as ApOptionValue])),
  [HEART_CAP_KEY]: setting?.heartCap as ApOptionValue,
});

/** A fresh mutable-safe copy for a creation form. */
const defaultDifficulty = (): DifficultySetting => ({
  copies: { ...DEFAULT_DIFFICULTY.copies },
  heartCap: DEFAULT_DIFFICULTY.heartCap,
});

export {
  copiesOfValues,
  defaultDifficulty,
  difficultyFromSnapshot,
  difficultyOfValues,
  difficultyValuesOf,
  heartCapOfValues,
};
