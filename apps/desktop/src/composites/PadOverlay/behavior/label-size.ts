/* @layer renderer-components @kind logic */
import { DETAIL_LINE_RATIO, DETAIL_SAMPLES, NAME_LINE_RATIO, UNDERLINE_GAP } from '../PadOverlay.constants';
import type { OverlayMetrics, OverlaySlotView } from '../PadOverlay.type';
import type { LabelSize } from './placement.type';

const labelSize = (slot: OverlaySlotView, { measure, fontPx }: OverlayMetrics): LabelSize => {
  const sample = DETAIL_SAMPLES[slot.kind];
  const hasDetail = sample !== '';
  return {
    w: Math.max(measure.name(slot.label), hasDetail ? measure.detail(sample) : 0),
    up: UNDERLINE_GAP + fontPx * NAME_LINE_RATIO,
    down: UNDERLINE_GAP + (hasDetail ? fontPx * DETAIL_LINE_RATIO : 0),
  };
};

export { labelSize };
