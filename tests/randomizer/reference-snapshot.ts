/* @layer tests @kind helper */
/**
 * The reference reading of the catalog as a snapshot: every row at the value
 * it shipped with, which is what an absent row of a stored snapshot still
 * means (legacy-absent-rows.data.ts), under the caller's overrides. The bare
 * catalog freeze is where a NEW profile starts and moves when the maintainer
 * moves it; the pinned counts, pools and digests in these suites were
 * measured on the reference world, so they build it here by name.
 *
 * The pre-v2 capacity spelling (one boolean) drives the capacity rows the
 * way buildOptionsSnapshot reads it, so the reference capacity rows step
 * aside when a caller passes it.
 */
import { CAPACITY_OPTION_KEYS, LEGACY_CAPACITY_KEY } from '@shared/randomizer/ap-world/capacity';
import { LEGACY_ABSENT_ROWS } from '@shared/randomizer/legacy-absent-rows.data';
import { buildOptionsSnapshot } from '@shared/randomizer/options-snapshot';
import type { ApOptionValue, RandomizerOptionsSnapshot } from '@shared/randomizer/ap-world/options.type';

type Values = Readonly<Record<string, ApOptionValue>>;

const REFERENCE_WITHOUT_CAPACITY: Values = Object.fromEntries(
  Object.entries(LEGACY_ABSENT_ROWS).filter(([key]) => !CAPACITY_OPTION_KEYS.includes(key)),
);

const referenceRowsFor = (overrides: Values): Values =>
  (LEGACY_CAPACITY_KEY in overrides ? REFERENCE_WITHOUT_CAPACITY : LEGACY_ABSENT_ROWS);

const referenceSnapshot = (overrides: Values = {}): RandomizerOptionsSnapshot =>
  buildOptionsSnapshot({ ...referenceRowsFor(overrides), ...overrides });

export { referenceSnapshot };
