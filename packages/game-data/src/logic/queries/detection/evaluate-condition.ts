/* @layer shared-game @kind logic */
import type { VariantCondition } from '../../../data';
import type { VariantGameState } from './detection.type';

const checkHolds = (condition: Extract<VariantCondition, { type: 'check' }>, state: VariantGameState): boolean => {
  if (!state.completedChecks) return false;
  const has = state.completedChecks.has(condition.id);
  return condition.collected ? has : !has;
};

const flagHolds = (condition: Extract<VariantCondition, { type: 'flag' }>, state: VariantGameState): boolean => {
  if (!state.readFlag) return false;
  return state.readFlag(condition.address, condition.bit) === condition.value;
};

const progressHolds = (condition: Extract<VariantCondition, { type: 'progress' }>, state: VariantGameState): boolean => {
  if (state.progressTier == null) return false;
  if (condition.min != null && state.progressTier < condition.min) return false;
  if (condition.max != null && state.progressTier > condition.max) return false;
  return true;
};

const evaluateCondition = (condition: VariantCondition, state: VariantGameState): boolean => {
  switch (condition.type) {
    case 'always':
      return true;
    case 'check':
      return checkHolds(condition, state);
    case 'flag':
      return flagHolds(condition, state);
    case 'entrance':
      return state.entranceId === condition.id;
    case 'progress':
      return progressHolds(condition, state);
  }
};

export { evaluateCondition };
