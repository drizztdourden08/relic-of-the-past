/* @layer renderer-components @kind logic */
import { DETAIL_LINE_RATIO, DETAIL_SAMPLES, LABEL_LINE_RATIO } from '../PadOverlay.constants';
import type { LabelMode, OverlaySlotView, TextMeasure } from '../PadOverlay.type';
import { labelWidth } from './label-width';
import type { LabelSize } from './placement.type';

const labelSize = (slot: OverlaySlotView, measure: TextMeasure, mode: LabelMode, fontPx: number): LabelSize => {
  const twoLines = mode === 'stacked' && DETAIL_SAMPLES[slot.kind] !== '';
  return { w: labelWidth(slot, measure, mode), h: fontPx * (LABEL_LINE_RATIO + (twoLines ? DETAIL_LINE_RATIO : 0)) };
};

export { labelSize };
