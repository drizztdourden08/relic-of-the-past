/* @layer shared-game @kind data */
/**
 * The thirteen tier rows of the option catalog — synthetic, unlocked, group
 * 'items', so they list beside the other item settings and each wears an
 * ordinary toggle. Together they replace the reference's swordless switch,
 * which is not in the catalog at all: unticking every blade row IS that
 * switch, so the question is asked here once instead of in two places.
 *
 * Every baseline is TICKED — the reference pool — so a fresh profile rolls the
 * seed it always rolled, and a snapshot frozen before these rows existed reads
 * the same way.
 */
import { PROGRESSIVE_FAMILIES } from './progressive-families.data';
import { progressiveTierKeyOf } from './progressive-option-keys';
import { progressiveFamilyName, progressiveTierName } from './progressive-display-names';
import type { ApOptionDef } from '../options.type';
import type { OptionDescription } from '../option-description.type';
import type { ProgressiveFamilyDef } from './progressive.type';

type Seed = Omit<ApOptionDef, 'description'>;

const base = {
  group: 'items' as const,
  kind: 'toggle' as const,
  implementation: 'active' as const,
  apDefault: true,
  baseline: true,
  locked: false,
  synthetic: true,
};

/**
 * Titled from the dataset rather than from wording written here
 * (progressive-display-names.ts): the record set knows what a family and each
 * of its rungs is called, and a checkout without it keeps the short neutral
 * words the family table carries.
 */
const tierSeed = (family: ProgressiveFamilyDef, index: number): Seed => ({
  ...base,
  key: progressiveTierKeyOf(family.id, index),
  displayName: `${progressiveFamilyName(family)}: ${progressiveTierName(family, index)}`,
});

const PROGRESSIVE_OPTION_SEEDS: readonly Seed[] = PROGRESSIVE_FAMILIES.flatMap((family) =>
  family.tierLabels.map((_neutral, index) => tierSeed(family, index)));

const TIER_DESCRIPTION: OptionDescription =
  'Unticked, this rung leaves the ladder and the rungs above it move down one.';

const PROGRESSIVE_TIER_DESCRIPTIONS: Readonly<Record<string, OptionDescription>> = Object.fromEntries(
  PROGRESSIVE_FAMILIES.flatMap((family) => family.tiers.map((_tier, index) =>
    [progressiveTierKeyOf(family.id, index), TIER_DESCRIPTION])),
);

export { PROGRESSIVE_OPTION_SEEDS, PROGRESSIVE_TIER_DESCRIPTIONS };
