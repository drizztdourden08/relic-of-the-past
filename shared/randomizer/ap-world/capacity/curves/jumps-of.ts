/* @layer shared-game @kind logic */
/**
 * Dispatch: a curve shape + count + span → the jumps. Clamps the count to
 * [minCountFor(span, maxJump), span] (a ladder cannot be cut finer than one
 * step per item, nor coarser than the family's largest item), runs the
 * generator through the scaler and the cap, or takes a valid free sequence
 * as-is — an invalid one degrades to the equal curve at the clamped count.
 */
import { CURVES } from './curves.data';
import { scaleToSpan } from './scale-to-span';
import { capJumps, minCountFor } from './cap-jumps';
import { isValidFreeSequence } from './free-sequence';
import type { CurveShape } from '../capacity-profile.type';

/** The count actually used for a span: enough items to cover it under the cap, at most one per step. */
const clampCount = (count: number, span: number, maxJump = Number.POSITIVE_INFINITY): number =>
  Math.max(1, minCountFor(span, maxJump), Math.min(Number.isFinite(count) ? Math.floor(count) : 1, span));

const jumpsOf = (shape: CurveShape, count: number, span: number, maxJump = Number.POSITIVE_INFINITY): number[] => {
  if (span <= 0) return [];
  const n = clampCount(count, span, maxJump);
  if (shape.curve === 'free' && isValidFreeSequence(shape.jumps, span, maxJump)) return [...shape.jumps];
  const weights = shape.curve === 'free' ? CURVES.equal(n) : CURVES[shape.curve](n);
  return capJumps(scaleToSpan(weights, span), maxJump);
};

export { clampCount, jumpsOf };
