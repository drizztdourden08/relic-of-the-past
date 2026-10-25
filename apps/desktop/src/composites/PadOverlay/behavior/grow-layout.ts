/* @layer renderer-components @kind logic */
import { GROW_EXTRA_ROWS, GROW_ROWS } from '../PadOverlay.constants';
import type { OverlayLayout } from '../PadOverlay.type';
import { attemptLayout } from './attempt-layout';
import { leaderLength } from './leader-length';
import type { FitInput, GrowRows } from './placement.type';

const growSteps = (): GrowRows[] => {
  const rows = Array.from({ length: GROW_ROWS + 1 }, (_, count) => count);
  return rows.flatMap((top) => rows.map((bottom) => ({ top, bottom }))).sort((a, b) => a.top + a.bottom - (b.top + b.bottom));
};

const growLayout = (input: FitInput, scale: number): OverlayLayout | null => {
  let best: { layout: OverlayLayout; score: number } | null = null;
  let limit = Infinity;
  for (const grow of growSteps()) {
    const rows = grow.top + grow.bottom;
    if (rows > limit) break;
    const layout = attemptLayout(input, scale, grow);
    if (!layout.clear) continue;
    if (!best) limit = rows + GROW_EXTRA_ROWS;
    const score = leaderLength(layout) + layout.frame.height;
    if (!best || score < best.score) best = { layout, score };
  }
  return best?.layout ?? null;
};

export { growLayout };
