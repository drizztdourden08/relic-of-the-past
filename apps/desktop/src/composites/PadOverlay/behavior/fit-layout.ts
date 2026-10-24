/* @layer renderer-components @kind logic */
import { MIN_SCALE_RATIO, REFINE_STEPS, SCALE_STEP, SEARCH_STEPS } from '../PadOverlay.constants';
import type { OverlayLayout } from '../PadOverlay.type';
import { attemptLayout } from './attempt-layout';
import { growLayout } from './grow-layout';
import type { FitInput } from './placement.type';
import { topScale } from './top-scale';

const refine = (input: FitInput, found: OverlayLayout, upper: number): OverlayLayout => {
  let best = found;
  let low = found.frame.scale;
  let high = upper;
  for (let step = 0; step < REFINE_STEPS && high > low; step += 1) {
    const middle = (low + high) / 2;
    const result = attemptLayout(input, middle);
    if (result.clear) {
      best = result;
      low = middle;
    } else {
      high = middle;
    }
  }
  return best;
};

const shrinkLayout = (input: FitInput, top: number): OverlayLayout => {
  let last: OverlayLayout | null = null;
  for (let step = 1; step < SEARCH_STEPS; step += 1) {
    const scale = top * (1 - step * SCALE_STEP);
    if (scale < top * MIN_SCALE_RATIO) break;
    last = attemptLayout(input, scale);
    if (last.clear) return refine(input, last, top * (1 - (step - 1) * SCALE_STEP));
  }
  return last ?? attemptLayout(input, top * MIN_SCALE_RATIO);
};

const fitLayout = (input: FitInput): OverlayLayout => {
  const top = topScale(input.bounds, input.metrics);
  const first = attemptLayout(input, top);
  if (first.clear) return first;
  return growLayout(input, top) ?? shrinkLayout(input, top);
};

export { fitLayout };
