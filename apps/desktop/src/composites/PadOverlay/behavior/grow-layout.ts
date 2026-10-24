/* @layer renderer-components @kind logic */
import { GROW_EXTRA_ROWS, GROW_ROWS, LABEL_LINE_RATIO } from '../PadOverlay.constants';
import type { OverlayLayout } from '../PadOverlay.type';
import { attemptLayout } from './attempt-layout';
import { leaderLength } from './leader-length';
import type { FitInput } from './placement.type';

const scoreOf = (layout: OverlayLayout, grownBy: number): number => leaderLength(layout) + grownBy;

const growLayout = (input: FitInput, scale: number): OverlayLayout | null => {
  const row = input.metrics.fontPx * LABEL_LINE_RATIO * 2;
  let best: { layout: OverlayLayout; score: number } | null = null;
  let last = GROW_ROWS;
  for (let rows = 1; rows <= last; rows += 1) {
    const grownBy = Math.ceil(rows * row);
    const layout = attemptLayout({ ...input, metrics: { ...input.metrics, height: input.metrics.height + grownBy } }, scale);
    if (!layout.clear) continue;
    if (!best) last = Math.min(GROW_ROWS, rows + GROW_EXTRA_ROWS);
    const score = scoreOf(layout, grownBy);
    if (!best || score < best.score) best = { layout, score };
  }
  return best?.layout ?? null;
};

export { growLayout };
