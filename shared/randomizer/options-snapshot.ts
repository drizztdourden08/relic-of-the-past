/* @layer shared-game @kind logic */
/**
 * The frozen option snapshot recorded on a randomized profile.
 * buildOptionsSnapshot freezes the whole catalog (baselines plus the caller's
 * unlocked choices). normalizeRandomizerOptions reads a stored snapshot back
 * over the baselines, so a row added to the catalog after the snapshot was
 * frozen reads as its baseline. Anything that is not a snapshot under the
 * current schema reads as a fresh one: an older shape is a clean break.
 */
import { baselineValues, optionByKey } from './world/options.data';
import type { OptionValue, RandomizerOptionsSnapshot } from './world/options.type';

const OPTIONS_SCHEMA = 'ap-options-v2';

type Values = Record<string, OptionValue>;

/** Full catalog freeze; overrides apply only to unlocked options. */
const buildOptionsSnapshot = (
  overrides: Readonly<Record<string, OptionValue>> = {},
): RandomizerOptionsSnapshot => {
  const values: Values = { ...baselineValues };
  for (const [key, value] of Object.entries(overrides)) {
    const option = optionByKey.get(key);
    if (option && !option.locked) values[key] = value;
  }
  return { schema: OPTIONS_SCHEMA, values };
};

const isOptionsSnapshot = (raw: unknown): raw is RandomizerOptionsSnapshot => {
  if (!raw || typeof raw !== 'object') return false;
  const candidate = raw as Partial<RandomizerOptionsSnapshot>;
  return candidate.schema === OPTIONS_SCHEMA
    && typeof candidate.values === 'object' && candidate.values !== null;
};

/** A stored snapshot over the baselines, or a fresh snapshot when the value is not one. */
const normalizeRandomizerOptions = (raw: unknown): RandomizerOptionsSnapshot =>
  (isOptionsSnapshot(raw)
    ? { schema: OPTIONS_SCHEMA, values: { ...baselineValues, ...raw.values } }
    : buildOptionsSnapshot());

export { OPTIONS_SCHEMA, buildOptionsSnapshot, isOptionsSnapshot, normalizeRandomizerOptions };
