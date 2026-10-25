/* @layer renderer-components @kind logic */
import type { OverlayLayout } from '../PadOverlay.type';
import { labelOptions } from './label-options';
import { placeLabels } from './place-labels';
import type { FitInput, GrowRows } from './placement.type';
import { sceneAt } from './scene-at';

const attemptLayout = (input: FitInput, scale: number, grow: GrowRows): OverlayLayout => {
  const scene = sceneAt(input, scale, grow);
  const options = scene.parts.map((part, index) => {
    const size = input.sizes.get(part.slot.anchor);
    return size ? labelOptions(index, size, scene, input.metrics.fontPx) : [];
  });
  const { labels, clear } = placeLabels(scene, options);
  return { frame: scene.frame, parts: [...scene.parts], labels, clear };
};

export { attemptLayout };
