/* @layer shared-game @kind barrel */
export {
  COPY_MULTIPLIERS, COPY_MULTIPLIER_LABELS, DEFAULT_COPY_MULTIPLIER, DEFAULT_COPY_MULTIPLIERS,
  DEFAULT_DIFFICULTY, DEFAULT_HEART_CAP, MAX_HEART_CAP, PIECES_PER_HEART, STARTING_HEARTS,
  asCopyMultiplier, asHeartCap, isReferenceDifficulty,
} from './difficulty.data';
export {
  DIFFICULTY_COPIES_KEYS, DIFFICULTY_OPTION_KEYS, DIFFICULTY_OPTION_KEY_SET, HEART_CAP_KEY,
  difficultyCopiesKeyOf, isDifficultyOptionKey,
} from './difficulty-option-keys';
export {
  DIFFICULTY_OPTION_DESCRIPTIONS, DIFFICULTY_OPTION_SEEDS,
} from './difficulty-options.data';
export {
  copiesOfValues, defaultDifficulty, difficultyFromSnapshot, difficultyOfValues,
  difficultyValuesOf, heartCapOfValues,
} from './difficulty-from-snapshot';
export { applyCopyMultipliers } from './difficulty-copies-pool';
export { applyHeartCap, heartGrowthOf } from './difficulty-hearts-pool';
export type { CopyMultiplier, CopyMultiplierSetting, DifficultySetting } from './difficulty.type';
