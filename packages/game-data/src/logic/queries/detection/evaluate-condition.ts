/* @layer shared-game @kind logic */
import type { VariantCondition } from '../../../data';
import type { VariantGameState } from './detection.type';

const evaluateCondition = (condition: VariantCondition, state: VariantGameState): boolean => {
  switch (condition.type) {
    case 'always':
      return true;
    case 'check': {
      if (!state.completedChecks) return false;
      const has = state.completedChecks.has(condition.id);
      return condition.collected ? has : !has;
    }
    case 'flag': {
      if (!state.readFlag) return false;
      const flagVal = state.readFlag(condition.address, condition.bit);
      return flagVal === condition.value;
    }
    case 'entrance':
      return state.entranceId === condition.id;
    case 'progress':
      if (state.progressTier == null) return false;
      if (condition.min != null && state.progressTier < condition.min) return false;
      if (condition.max != null && state.progressTier > condition.max) return false;
      return true;
  }
};

export { evaluateCondition };
