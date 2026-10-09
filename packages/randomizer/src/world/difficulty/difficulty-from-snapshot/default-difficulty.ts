/* @layer shared-game @kind logic */
import { DEFAULT_DIFFICULTY } from '../difficulty';
import type { DifficultySetting } from '../difficulty.type';

const defaultDifficulty = (): DifficultySetting => ({
  copies: { ...DEFAULT_DIFFICULTY.copies },
  heartCap: DEFAULT_DIFFICULTY.heartCap,
});

export { defaultDifficulty };
