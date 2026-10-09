/* @layer shared-game @kind constants */
import { PROGRESSIVE_FAMILIES } from './progressive-families.data';
import { progressiveModeKeyOf } from './progressive-mode-keys';
import { progressiveModeSeed } from './progressive-mode-seed';
import type { OptionSeed } from '../options.type';
import type { OptionDescription } from '../option-description.type';

const PROGRESSIVE_MODE_OPTION_SEEDS: readonly OptionSeed[] = PROGRESSIVE_FAMILIES.map(progressiveModeSeed);

const MODE_DESCRIPTION: OptionDescription =
  'Any order makes each copy a specific rung, so the top of the ladder can turn up first.';

const PROGRESSIVE_MODE_DESCRIPTIONS: Readonly<Record<string, OptionDescription>> = Object.fromEntries(
  PROGRESSIVE_FAMILIES.map((family) => [progressiveModeKeyOf(family.id), MODE_DESCRIPTION]),
);

export { PROGRESSIVE_MODE_DESCRIPTIONS, PROGRESSIVE_MODE_OPTION_SEEDS };
