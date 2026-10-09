/* @layer shared-game @kind data */
import type { ProgressiveFamilyMode, ProgressiveModeSetting } from '../progressive.type';

const PROGRESSIVE_MODES: readonly ProgressiveFamilyMode[] = ['progressive', 'random'];

const PROGRESSIVE_MODE_LABELS: Readonly<Record<ProgressiveFamilyMode, string>> = {
  progressive: 'In order',
  random: 'Any order',
};

const DEFAULT_PROGRESSIVE_MODES: ProgressiveModeSetting = {
  sword: 'progressive',
  shield: 'progressive',
  mail: 'progressive',
  glove: 'progressive',
  bow: 'progressive',
  ocarina: 'progressive',
};

export { DEFAULT_PROGRESSIVE_MODES, PROGRESSIVE_MODES, PROGRESSIVE_MODE_LABELS };
