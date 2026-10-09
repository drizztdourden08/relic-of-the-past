/* @layer shared-game @kind logic */
import { minCountFor } from '../min-count-for';

const clampCount = (count: number, span: number, maxJump = Number.POSITIVE_INFINITY): number =>
  Math.max(1, minCountFor(span, maxJump), Math.min(Number.isFinite(count) ? Math.floor(count) : 1, span));

export { clampCount };
