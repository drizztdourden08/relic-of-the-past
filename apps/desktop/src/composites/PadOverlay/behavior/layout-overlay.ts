/* @layer renderer-components @kind logic */
import type { ControllerSilhouetteAnchorSet } from '@drizztdourden08/tessera/composites';
import { LABEL_GAP } from '../PadOverlay.constants';
import type { OverlayLayout, OverlayMetrics, OverlaySlotView } from '../PadOverlay.type';
import { contentBounds } from './content-bounds';
import { fitLayout } from './fit-layout';
import { labelSize } from './label-size';
import { outlinePoints } from './outline-points';
import { rawParts } from './raw-parts';

const layoutOverlay = (
  slots: readonly OverlaySlotView[], anchors: ControllerSilhouetteAnchorSet, outline: string, metrics: OverlayMetrics,
): OverlayLayout => {
  const raw = rawParts(slots, anchors);
  const sizes = new Map(raw.map((part) => [part.slot.anchor, labelSize(part.slot, metrics)]));
  const tallest = Math.max(0, ...[...sizes.values()].map((size) => size.up + size.down));
  return fitLayout({
    raw,
    bounds: contentBounds(outline, raw),
    points: outlinePoints(outline),
    metrics,
    sizes,
    rowH: tallest + LABEL_GAP,
  });
};

export { layoutOverlay };
