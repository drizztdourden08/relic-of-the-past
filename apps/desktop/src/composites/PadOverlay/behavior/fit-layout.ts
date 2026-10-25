/* @layer renderer-components @kind logic */
import { GROW_ROWS, MIN_SCALE_RATIO, SCALE_STEP, SEARCH_STEPS } from '../PadOverlay.constants';
import type { OverlayLayout } from '../PadOverlay.type';
import { attemptLayout } from './attempt-layout';
import { growLayout } from './grow-layout';
import type { FitInput } from './placement.type';
import { topScale } from './top-scale';

const shrinkLayout = (input: FitInput, top: number): OverlayLayout => {
  const roomiest = { top: GROW_ROWS, bottom: GROW_ROWS };
  let scale = top;
  for (let step = 1; step < SEARCH_STEPS; step += 1) {
    const next = top * (1 - step * SCALE_STEP);
    if (next < top * MIN_SCALE_RATIO) break;
    scale = next;
    if (attemptLayout(input, scale, roomiest).clear) return growLayout(input, scale) ?? attemptLayout(input, scale, roomiest);
  }
  return attemptLayout(input, scale, roomiest);
};

const fitLayout = (input: FitInput): OverlayLayout => {
  const top = topScale(input);
  return growLayout(input, top) ?? shrinkLayout(input, top);
};

export { fitLayout };
