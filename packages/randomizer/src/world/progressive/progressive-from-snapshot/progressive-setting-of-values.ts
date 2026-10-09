/* @layer shared-game @kind logic */
import { optionFlagOf } from '../../option-flag-of';
import { PROGRESSIVE_FAMILIES } from '../progressive-families.constants';
import { progressiveTierKeyOf } from '../progressive-option-keys';
import { defaultTickOf } from './default-tick-of';
import type { OptionValues } from '../../options.type';
import type { ProgressiveSetting } from '../progressive.type';

const progressiveSettingOfValues = (values: OptionValues): ProgressiveSetting =>
  Object.fromEntries(PROGRESSIVE_FAMILIES.map((family) => [
    family.id,
    family.tiers.map((_tier, index) =>
      optionFlagOf(values, progressiveTierKeyOf(family.id, index), defaultTickOf(family.id, index))),
  ])) as unknown as ProgressiveSetting;

export { progressiveSettingOfValues };
