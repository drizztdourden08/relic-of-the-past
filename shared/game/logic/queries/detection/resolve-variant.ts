/* @layer shared-game @kind logic */
import type { ScreenRecord } from '../../../data';
import type { VariantGameState } from './detection.type';
import { evaluateCondition } from './evaluate-condition';

const isDefaultVariant = (candidate: ScreenRecord): boolean =>
  !candidate.variant || candidate.variant.condition.type === 'always';

const resolveVariant = (candidates: ScreenRecord[], state?: VariantGameState): ScreenRecord => {
  if (candidates.length === 1) return candidates[0];
  if (!state) return candidates.find(isDefaultVariant) ?? candidates[0];

  for (const c of candidates) {
    if (c.variant && c.variant.condition.type !== 'always') {
      if (evaluateCondition(c.variant.condition, state)) return c;
    }
  }

  return candidates.find(isDefaultVariant) ?? candidates[0];
};

export { resolveVariant };
