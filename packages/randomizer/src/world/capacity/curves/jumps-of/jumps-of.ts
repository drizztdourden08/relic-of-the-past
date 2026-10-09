/* @layer shared-game @kind logic */
import { CURVES } from '../curves.constants';
import { scaleToSpan } from '../scale-to-span';
import { capJumps } from '../cap-jumps';
import { isValidFreeSequence } from '../free-sequence';
import { clampCount } from './clamp-count';
import type { CurveShape } from '../../capacity-profile.type';

const jumpsOf = (shape: CurveShape, count: number, span: number, maxJump = Number.POSITIVE_INFINITY): number[] => {
  if (span <= 0) return [];
  const n = clampCount(count, span, maxJump);
  if (shape.curve === 'free' && isValidFreeSequence(shape.jumps, span, maxJump)) return [...shape.jumps];
  const weights = shape.curve === 'free' ? CURVES.equal(n) : CURVES[shape.curve](n);
  return capJumps(scaleToSpan(weights, span), maxJump);
};

export { jumpsOf };
