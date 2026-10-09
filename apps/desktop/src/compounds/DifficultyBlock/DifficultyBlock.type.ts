/* @layer renderer-components @kind types */
import type { DifficultySetting, ProgressiveSetting } from '@rotp/randomizer';

interface DifficultyBlockProps {
  setting: DifficultySetting;
  tiers: ProgressiveSetting;
  onChange?: (next: DifficultySetting) => void;
}

export type { DifficultyBlockProps };
