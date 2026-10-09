/* @layer renderer-components @kind types */
import type { DifficultySetting } from '@shared/randomizer/world/difficulty/difficulty.type';
import type { ProgressiveSetting } from '@shared/randomizer/world/progressive/progressive.type';

interface DifficultyBlockProps {
  setting: DifficultySetting;
  tiers: ProgressiveSetting;
  onChange?: (next: DifficultySetting) => void;
}

export type { DifficultyBlockProps };
