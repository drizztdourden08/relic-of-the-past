/* @layer renderer-components @kind types */
import type { DifficultySetting } from '@rotp/randomizer';
import type { ProgressiveSetting } from '@rotp/randomizer';

interface DifficultyBlockProps {
  setting: DifficultySetting;
  tiers: ProgressiveSetting;
  onChange?: (next: DifficultySetting) => void;
}

export type { DifficultyBlockProps };
