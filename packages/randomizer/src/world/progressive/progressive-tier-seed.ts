/* @layer shared-game @kind logic */
import { DEFAULT_PROGRESSIVE_SETTING } from './progressive-families.constants';
import { progressiveTierKeyOf } from './progressive-option-keys';
import { progressiveFamilyName, progressiveTierName } from './progressive-display-names';
import { PROGRESSIVE_TIER_ROW } from './progressive-tier-row.constants';
import type { OptionSeed } from '../options.type';
import type { ProgressiveFamilyDef } from './progressive.type';

const progressiveTierSeed = (family: ProgressiveFamilyDef, index: number): OptionSeed => {
  const ticked = DEFAULT_PROGRESSIVE_SETTING[family.id][index] ?? true;
  return {
    ...PROGRESSIVE_TIER_ROW,
    sourceDefault: ticked,
    baseline: ticked,
    key: progressiveTierKeyOf(family.id, index),
    displayName: `${progressiveFamilyName(family)}: ${progressiveTierName(family, index)}`,
  };
};

export { progressiveTierSeed };
