/* @layer renderer-components @kind logic */
import type { ControllerSilhouetteAnchorSet } from '@drizztdourden08/tessera/composites';
import { STACKED_WIN } from '../PadOverlay.constants';
import type { LabelMode, OverlayLayout, OverlayMetrics, OverlaySlotView } from '../PadOverlay.type';
import { contentBounds } from './content-bounds';
import { fitLayout } from './fit-layout';
import { labelSize } from './label-size';
import { outlinePoints } from './outline-points';
import { rawParts } from './raw-parts';
import { topScale } from './top-scale';

const better = (inline: OverlayLayout, stacked: OverlayLayout): OverlayLayout => {
  if (inline.clear !== stacked.clear) return inline.clear ? inline : stacked;
  if (stacked.frame.scale > inline.frame.scale * STACKED_WIN) return stacked;
  const sameScale = stacked.frame.scale >= inline.frame.scale;
  return sameScale && stacked.frame.height < inline.frame.height ? stacked : inline;
};

const layoutOverlay = (
  slots: readonly OverlaySlotView[], anchors: ControllerSilhouetteAnchorSet, outline: string, metrics: OverlayMetrics,
): OverlayLayout => {
  const raw = rawParts(slots, anchors);
  const bounds = contentBounds(outline, raw);
  const points = outlinePoints(outline);
  const fitFor = (mode: LabelMode): OverlayLayout => {
    const sizes = new Map(raw.map((part) => [part.slot.anchor, labelSize(part.slot, metrics.measure, mode, metrics.fontPx)]));
    return fitLayout({ raw, bounds, points, metrics, mode, sizes });
  };
  const inline = fitFor('inline');
  const roomy = inline.clear && inline.frame.scale >= topScale(bounds, metrics) && inline.frame.height <= metrics.height;
  return roomy ? inline : better(inline, fitFor('stacked'));
};

export { layoutOverlay };
