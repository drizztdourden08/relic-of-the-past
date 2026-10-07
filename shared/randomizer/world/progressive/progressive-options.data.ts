/* @layer shared-game @kind data */
/**
 * The fifteen tier rows of the option catalog: synthetic, unlocked, group
 * 'items', so they list beside the other item settings and each wears an
 * ordinary toggle. Together they replace the reference's swordless switch,
 * which is not in the catalog at all: unticking every blade row IS that
 * switch, so the question is asked here once instead of in two places.
 *
 * Every baseline is the family's default tick (the reference pool): every rung,
 * but the ocarina's second, which is off because the reference pool holds one
 * Flute that play wakes at the weathervane.
 */
import { DEFAULT_PROGRESSIVE_SETTING, PROGRESSIVE_FAMILIES } from './progressive-families.data';
import { progressiveTierKeyOf } from './progressive-option-keys';
import { progressiveFamilyName, progressiveTierName } from './progressive-display-names';
import type { OptionDef } from '../options.type';
import type { OptionDescription } from '../option-description.type';
import type { ProgressiveFamilyDef } from './progressive.type';

type Seed = Omit<OptionDef, 'description'>;

const base = {
  group: 'items' as const,
  kind: 'toggle' as const,
  implementation: 'active' as const,
  sourceDefault: true,
  baseline: true,
  locked: false,
  synthetic: true,
};

/**
 * Titled from the dataset instead of from wording written here
 * (progressive-display-names.ts): the record set knows what a family and each
 * of its rungs is called, and a checkout without it keeps the short neutral
 * words the family table carries.
 */
const tierSeed = (family: ProgressiveFamilyDef, index: number): Seed => {
  const ticked = DEFAULT_PROGRESSIVE_SETTING[family.id][index] ?? true;
  return {
    ...base,
    sourceDefault: ticked,
    baseline: ticked,
    key: progressiveTierKeyOf(family.id, index),
    displayName: `${progressiveFamilyName(family)}: ${progressiveTierName(family, index)}`,
  };
};

const PROGRESSIVE_OPTION_SEEDS: readonly Seed[] = PROGRESSIVE_FAMILIES.flatMap((family) =>
  family.tierLabels.map((_neutral, index) => tierSeed(family, index)));

const TIER_DESCRIPTION: OptionDescription =
  'Unticked, this rung leaves the ladder and the rungs above it move down one.';

/** The ocarina's second rung is the one that is off by default, so it says what each state does. */
const ACTIVATED_FLUTE_DESCRIPTION: OptionDescription =
  'Ticked, the Activated Flute is in the item pool as a second Progressive Ocarina. '
  + 'Unticked, the Flute is woken at the weathervane.';

const descriptionOf = (family: ProgressiveFamilyDef, index: number): OptionDescription =>
  (family.id === 'ocarina' && index === 1 ? ACTIVATED_FLUTE_DESCRIPTION : TIER_DESCRIPTION);

const PROGRESSIVE_TIER_DESCRIPTIONS: Readonly<Record<string, OptionDescription>> = Object.fromEntries(
  PROGRESSIVE_FAMILIES.flatMap((family) => family.tiers.map((_tier, index) =>
    [progressiveTierKeyOf(family.id, index), descriptionOf(family, index)])),
);

export { PROGRESSIVE_OPTION_SEEDS, PROGRESSIVE_TIER_DESCRIPTIONS };
