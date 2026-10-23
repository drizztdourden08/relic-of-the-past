/* @layer renderer-components @kind logic */
import { settleRun } from './settle-run';
import type { Run, SpreadBounds } from './spread-column.type';

const spreadColumn = (wanted: readonly number[], bounds: SpreadBounds): number[] => {
  const { min, max, lineH, minLineH } = bounds;
  const fit = wanted.length > 1 ? (max - min) / (wanted.length - 1) : lineH;
  const gap = Math.max(Math.min(lineH, fit), minLineH);
  const runs: Run[] = [];
  for (const y of wanted) {
    let next = settleRun(y, 1, gap, bounds);
    for (let last = runs.at(-1); last && last.top + last.count * gap > next.top; last = runs.at(-1)) {
      runs.pop();
      next = settleRun(last.sum + next.sum, last.count + next.count, gap, bounds);
    }
    runs.push(next);
  }
  return runs.flatMap((run) => Array.from({ length: run.count }, (_, index) => run.top + index * gap));
};

export { spreadColumn };
