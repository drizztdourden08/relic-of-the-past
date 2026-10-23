/* @layer renderer-components @kind logic */
import type { Run, SpreadBounds } from './spread-column.type';

const settleRun = (sum: number, count: number, gap: number, bounds: Pick<SpreadBounds, 'min' | 'max'>): Run => {
  const span = (count - 1) * gap;
  return { sum, count, top: Math.min(Math.max(sum / count - span / 2, bounds.min), bounds.max - span) };
};

export { settleRun };
