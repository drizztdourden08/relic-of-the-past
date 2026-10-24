/* @layer renderer-components @kind logic */
import { DETAIL_SAMPLES } from '../PadOverlay.constants';
import type { LabelMode, OverlaySlotView, TextMeasure } from '../PadOverlay.type';

const labelWidth = (slot: OverlaySlotView, measure: TextMeasure, mode: LabelMode): number => {
  const sample = DETAIL_SAMPLES[slot.kind];
  const name = measure.name(slot.label);
  if (sample === '') return name;
  return mode === 'inline' ? name + measure.detail(` ${sample}`) : Math.max(name, measure.detail(sample));
};

export { labelWidth };
