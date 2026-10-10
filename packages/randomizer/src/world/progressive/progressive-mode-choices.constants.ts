/* @layer shared-game @kind constants */
import { PROGRESSIVE_MODES, PROGRESSIVE_MODE_LABELS } from './progressive-modes';
import type { OptionChoice } from '../options.type';
import type { ProgressiveFamilyMode } from './progressive.type';

const MODE_SOURCE_VALUE: Readonly<Record<ProgressiveFamilyMode, number>> ={ progressive: 2, random: 0 };

const MODE_CHOICES: readonly OptionChoice[] = PROGRESSIVE_MODES.map((mode) => ({
  value: mode,
  sourceValue: MODE_SOURCE_VALUE[mode],
  label: PROGRESSIVE_MODE_LABELS[mode],
}));

export { MODE_CHOICES, MODE_SOURCE_VALUE };
