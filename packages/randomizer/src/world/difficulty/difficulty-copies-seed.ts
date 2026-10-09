/* @layer shared-game @kind logic */
import { PROGRESSIVE_FAMILIES } from '../progressive/progressive-families.constants';
import { progressiveFamilyName } from '../progressive/progressive-display-names';
import { COPY_MULTIPLIERS, DEFAULT_COPY_MULTIPLIER } from './difficulty';
import { difficultyCopiesKeyOf } from './difficulty-option-keys';
import type { OptionSeed } from '../options.type';

const difficultyCopiesSeed = (index: number): OptionSeed => ({
  key: difficultyCopiesKeyOf(PROGRESSIVE_FAMILIES[index].id),
  displayName: `${progressiveFamilyName(PROGRESSIVE_FAMILIES[index])}: copies`,
  group: 'items',
  kind: 'range',
  implementation: 'active',
  range: { min: COPY_MULTIPLIERS[0], max: COPY_MULTIPLIERS[COPY_MULTIPLIERS.length - 1] },
  sourceDefault: DEFAULT_COPY_MULTIPLIER,
  baseline: DEFAULT_COPY_MULTIPLIER,
  locked: false,
  synthetic: true,
});

export { difficultyCopiesSeed };
