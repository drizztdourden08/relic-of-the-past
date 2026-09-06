/* @layer renderer-components @kind types */
import type { DifficultySetting } from '@shared/randomizer/ap-world/difficulty/difficulty.type';
import type { ProgressiveSetting } from '@shared/randomizer/ap-world/progressive/progressive.type';

interface DifficultyBlockProps {
  setting: DifficultySetting;
  /**
   * The tier ticks standing above this block. A family with no rung left
   * carries no copy at all, so its multiple has nothing to act on and its
   * control is shown inert with the reason on it — the same reading the
   * item-power rows take from the same ticks.
   */
  tiers: ProgressiveSetting;
  /** Absent renders the whole block frozen. */
  onChange?: (next: DifficultySetting) => void;
}

export type { DifficultyBlockProps };
