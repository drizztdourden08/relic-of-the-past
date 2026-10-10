/* @layer shared-game @kind logic */
import { recordBy } from '../../../keyed-record';
import { PROGRESSIVE_FAMILIES } from '../progressive-families.constants';
import { progressiveModeKeyOf } from '../progressive-mode-keys';
import type { OptionValues } from '../../options.type';
import type { ProgressiveFamilyMode, ProgressiveModeSetting } from '../progressive.type';

const modeAt = (values: OptionValues, key: string): ProgressiveFamilyMode =>
  (values[key] === 'random' ? 'random' : 'progressive');

const progressiveModesOfValues = (values: OptionValues): ProgressiveModeSetting =>
  recordBy(PROGRESSIVE_FAMILIES, (family) => family.id, (family) => modeAt(values, progressiveModeKeyOf(family.id)));

export { progressiveModesOfValues };
