/* @layer renderer-components @kind logic */
import { FRAME_PAD } from '../PadOverlay.constants';
import type { Bounds, OverlayMetrics } from '../PadOverlay.type';

const topScale = (bounds: Bounds, metrics: OverlayMetrics): number =>
  Math.min((metrics.width - FRAME_PAD * 2) / bounds.w, (metrics.height - FRAME_PAD * 2) / bounds.h);

export { topScale };
