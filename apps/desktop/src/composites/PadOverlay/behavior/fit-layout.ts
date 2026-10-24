/* @layer renderer-components @kind logic */
import { MIN_SCALE_RATIO, REFINE_STEPS, SCALE_STEP, SEARCH_STEPS } from '../PadOverlay.constants';
import type { OverlayLayout } from '../PadOverlay.type';
import { labelOptions } from './label-options';
import { placeLabels } from './place-labels';
import type { FitInput } from './placement.type';
import { sceneAt } from './scene-at';
import { topScale } from './top-scale';

const attempt = (input: FitInput, scale: number): OverlayLayout => {
  const scene = sceneAt(input, scale);
  const options = scene.parts.map((part, index) => {
    const size = input.sizes.get(part.slot.anchor) ?? { w: 0, h: scene.frame.labelH };
    return labelOptions(index, size, scene, input.metrics.fontPx);
  });
  const { labels, clear } = placeLabels(scene, options);
  return { frame: scene.frame, parts: [...scene.parts], labels, clear };
};

const refine = (input: FitInput, found: OverlayLayout, upper: number): OverlayLayout => {
  let best = found;
  let low = found.frame.scale;
  let high = upper;
  for (let step = 0; step < REFINE_STEPS && high > low; step += 1) {
    const middle = (low + high) / 2;
    const result = attempt(input, middle);
    if (result.clear) {
      best = result;
      low = middle;
    } else {
      high = middle;
    }
  }
  return best;
};

const fitLayout = (input: FitInput): OverlayLayout => {
  const top = topScale(input.bounds, input.metrics);
  let last: OverlayLayout | null = null;
  for (let step = 0; step < SEARCH_STEPS; step += 1) {
    const scale = top * (1 - step * SCALE_STEP);
    if (scale < top * MIN_SCALE_RATIO) break;
    last = attempt(input, scale);
    if (last.clear) return step === 0 ? last : refine(input, last, top * (1 - (step - 1) * SCALE_STEP));
  }
  return last ?? attempt(input, top * MIN_SCALE_RATIO);
};

export { fitLayout };
