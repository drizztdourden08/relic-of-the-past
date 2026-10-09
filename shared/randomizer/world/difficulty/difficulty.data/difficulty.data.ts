/* @layer shared-game @kind data */
import type { CopyMultiplier, CopyMultiplierSetting, DifficultySetting } from '../difficulty.type';

const COPY_MULTIPLIERS: readonly CopyMultiplier[] = [1, 2, 3];

const COPY_MULTIPLIER_LABELS: Readonly<Record<CopyMultiplier, string>> = {
  1: 'Normal',
  2: 'Double',
  3: 'Triple',
};

const DEFAULT_COPY_MULTIPLIER: CopyMultiplier = 1;

const MAX_HEART_CAP = 20;

const STARTING_HEARTS = 3;

const PIECES_PER_HEART = 4;

const DEFAULT_HEART_CAP = MAX_HEART_CAP;

const DEFAULT_COPY_MULTIPLIERS: CopyMultiplierSetting = {
  sword: DEFAULT_COPY_MULTIPLIER,
  shield: DEFAULT_COPY_MULTIPLIER,
  mail: DEFAULT_COPY_MULTIPLIER,
  glove: DEFAULT_COPY_MULTIPLIER,
  bow: DEFAULT_COPY_MULTIPLIER,
  ocarina: DEFAULT_COPY_MULTIPLIER,
};

const DEFAULT_DIFFICULTY: DifficultySetting = {
  copies: DEFAULT_COPY_MULTIPLIERS,
  heartCap: DEFAULT_HEART_CAP,
};

export {
  COPY_MULTIPLIERS,
  COPY_MULTIPLIER_LABELS,
  DEFAULT_COPY_MULTIPLIER,
  DEFAULT_COPY_MULTIPLIERS,
  DEFAULT_DIFFICULTY,
  DEFAULT_HEART_CAP,
  MAX_HEART_CAP,
  PIECES_PER_HEART,
  STARTING_HEARTS,
};
