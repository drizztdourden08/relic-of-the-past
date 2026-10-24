/* @layer renderer-components @kind logic */
import type { OverlayLayout } from '../PadOverlay.type';
import { labelOptions } from './label-options';
import { placeLabels } from './place-labels';
import type { FitInput } from './placement.type';
import { sceneAt } from './scene-at';

const attemptLayout = (input: FitInput, scale: number): OverlayLayout => {
  const scene = sceneAt(input, scale);
  const options = scene.parts.map((part, index) => {
    const size = input.sizes.get(part.slot.anchor) ?? { w: 0, h: scene.frame.labelH };
    return labelOptions(index, size, scene, input.metrics.fontPx);
  });
  const { labels, clear } = placeLabels(scene, options);
  return { frame: scene.frame, parts: [...scene.parts], labels, clear };
};

export { attemptLayout };
