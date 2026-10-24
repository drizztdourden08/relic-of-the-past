/* @layer renderer-components @kind logic */
import type { ControllerSilhouetteAnchorSet } from '@drizztdourden08/tessera/composites';
import { STACKED_WIN } from '../PadOverlay.constants';
import type { LabelMode, OverlayLayout, OverlayMetrics, OverlaySlotView } from '../PadOverlay.type';
import { assignSides } from './assign-sides';
import { contentBounds } from './content-bounds';
import { fitLayout } from './fit-layout';
import { labelWidth } from './label-width';
import { outlinePoints } from './outline-points';
import { rawParts } from './raw-parts';

const layoutOverlay = (
  slots: readonly OverlaySlotView[], anchors: ControllerSilhouetteAnchorSet, outline: string, metrics: OverlayMetrics,
): OverlayLayout => {
  const raw = rawParts(slots, anchors);
  const bounds = contentBounds(outline, raw);
  const sides = assignSides(raw, bounds.x + bounds.w / 2);
  const points = outlinePoints(outline);
  const fitFor = (mode: LabelMode): OverlayLayout => {
    const widths = new Map(raw.map((part) => [part.slot.anchor, labelWidth(part.slot, metrics.measure, mode)]));
    return fitLayout({ raw, bounds, sides, points, metrics, mode, widths });
  };
  const inline = fitFor('inline');
  const stacked = fitFor('stacked');
  return stacked.frame.scale > inline.frame.scale * STACKED_WIN ? stacked : inline;
};

export { layoutOverlay };
