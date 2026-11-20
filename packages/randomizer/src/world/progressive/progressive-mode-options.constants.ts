/* @layer shared-game @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { PROGRESSIVE_FAMILIES } from './progressive-families.constants';
import { progressiveModeKeyOf } from './progressive-mode-keys';
import { progressiveModeSeed } from './progressive-mode-seed';
import type { OptionSeed } from '../options.type';
import type { OptionDescriptionSource } from '../option-description.type';

const PROGRESSIVE_MODE_OPTION_SEEDS: readonly OptionSeed[] = PROGRESSIVE_FAMILIES.map(progressiveModeSeed);

const MODE_DESCRIPTION: OptionDescriptionSource = msg('randomizer-world:desc.anyOrder');

const PROGRESSIVE_MODE_DESCRIPTIONS: Readonly<Record<string, OptionDescriptionSource>> = Object.fromEntries(
  PROGRESSIVE_FAMILIES.map((family) => [progressiveModeKeyOf(family.id), MODE_DESCRIPTION]),
);

export { PROGRESSIVE_MODE_DESCRIPTIONS, PROGRESSIVE_MODE_OPTION_SEEDS };
