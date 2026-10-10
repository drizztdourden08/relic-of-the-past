/* @layer shared-game @kind logic */
import { itemAt } from '../../checked-access';
import { PROGRESSIVE_FAMILIES } from '../progressive/progressive-families.constants';
import { progressiveFamilyName } from '../progressive/progressive-display-names';
import { COPY_MULTIPLIERS, DEFAULT_COPY_MULTIPLIER } from './difficulty';
import { difficultyCopiesKeyOf } from './difficulty-option-keys';
import type { OptionSeed } from '../options.type';

const difficultyCopiesSeed = (index: number): OptionSeed => {
  const family = itemAt(PROGRESSIVE_FAMILIES, index);
  return {
    key: difficultyCopiesKeyOf(family.id),
    displayName: `${progressiveFamilyName(family)}: copies`,
    group: 'items',
    kind: 'range',
    implementation: 'active',
    range: { min: itemAt(COPY_MULTIPLIERS, 0), max: itemAt(COPY_MULTIPLIERS, COPY_MULTIPLIERS.length - 1) },
    sourceDefault: DEFAULT_COPY_MULTIPLIER,
    baseline: DEFAULT_COPY_MULTIPLIER,
    locked: false,
    synthetic: true,
  };
};

export { difficultyCopiesSeed };
