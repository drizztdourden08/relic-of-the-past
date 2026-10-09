/* @layer shared-game @kind constants */
import { PROGRESSIVE_FAMILIES } from './progressive-families.data';
import { progressiveTierKeyOf } from './progressive-option-keys';
import { progressiveTierDescriptionOf } from './progressive-tier-description-of';
import { progressiveTierSeed } from './progressive-tier-seed';
import type { OptionSeed } from '../options.type';
import type { OptionDescription } from '../option-description.type';

const PROGRESSIVE_OPTION_SEEDS: readonly OptionSeed[] = PROGRESSIVE_FAMILIES.flatMap((family) =>
  family.tierLabels.map((_neutral, index) => progressiveTierSeed(family, index)));

const PROGRESSIVE_TIER_DESCRIPTIONS: Readonly<Record<string, OptionDescription>> = Object.fromEntries(
  PROGRESSIVE_FAMILIES.flatMap((family) => family.tiers.map((_tier, index) =>
    [progressiveTierKeyOf(family.id, index), progressiveTierDescriptionOf(family, index)])),
);

export { PROGRESSIVE_OPTION_SEEDS, PROGRESSIVE_TIER_DESCRIPTIONS };
