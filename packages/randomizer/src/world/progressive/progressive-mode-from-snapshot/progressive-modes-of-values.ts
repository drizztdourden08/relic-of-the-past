/* @layer shared-game @kind logic */
import { PROGRESSIVE_FAMILIES } from '../progressive-families.constants';
import { progressiveModeKeyOf } from '../progressive-mode-keys';
import type { OptionValues } from '../../options.type';
import type { ProgressiveFamilyMode, ProgressiveModeSetting } from '../progressive.type';

const modeAt = (values: OptionValues, key: string): ProgressiveFamilyMode =>
  (values[key] === 'random' ? 'random' : 'progressive');

const progressiveModesOfValues = (values: OptionValues): ProgressiveModeSetting =>
  Object.fromEntries(PROGRESSIVE_FAMILIES.map((family) => [
    family.id, modeAt(values, progressiveModeKeyOf(family.id)),
  ])) as unknown as ProgressiveModeSetting;

export { progressiveModesOfValues };
