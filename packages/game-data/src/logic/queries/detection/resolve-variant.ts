/* @layer shared-game @kind logic */
import type { ScreenRecord } from '../../../data';
import type { VariantGameState } from './detection.type';
import { evaluateCondition } from './evaluate-condition';

const isDefaultVariant = (candidate: ScreenRecord): boolean =>
  !candidate.variant || candidate.variant.condition.type === 'always';

const matchingVariant = (candidates: ScreenRecord[], state: VariantGameState): ScreenRecord | undefined =>
  candidates.find((c) => c.variant !== undefined
    && c.variant.condition.type !== 'always'
    && evaluateCondition(c.variant.condition, state));

const resolveVariant = (candidates: ScreenRecord[], state?: VariantGameState): ScreenRecord => {
  const [first] = candidates;
  if (first === undefined) throw new Error('resolveVariant needs at least one candidate screen');
  if (candidates.length === 1) return first;
  const matched = state ? matchingVariant(candidates, state) : undefined;
  return matched ?? candidates.find(isDefaultVariant) ?? first;
};

export { resolveVariant };
