/* @layer renderer-components @kind logic */
import { DETAIL_LINE_RATIO, FRAME_PAD, LINE_RATIO, MIN_LINE_RATIO, STACKED_LINE_RATIO } from '../PadOverlay.constants';
import type { FitInput, FramedParts, OverlayFrame } from '../PadOverlay.type';
import { bandEdge } from './band-edge';
import { scaleParts } from './scale-parts';

const frameAt = (input: FitInput, scale: number, shift: number): FramedParts => {
  const { bounds, metrics, mode, raw, points } = input;
  const { width, height, fontPx } = metrics;
  const origin = {
    x: (width - bounds.w * scale) / 2 - bounds.x * scale + shift,
    y: (height - bounds.h * scale) / 2 - bounds.y * scale,
  };
  const stacked = mode === 'stacked';
  const lineH = fontPx * (stacked ? STACKED_LINE_RATIO : LINE_RATIO);
  const minLineH = fontPx * (stacked ? 1 + DETAIL_LINE_RATIO : MIN_LINE_RATIO);
  const shape = points.map((point) => ({ x: origin.x + point.x * scale, y: origin.y + point.y * scale }));
  const parts = scaleParts(raw, { origin, scale });
  const half = minLineH / 2;
  const frame: OverlayFrame = {
    width,
    height,
    mode,
    scale,
    origin,
    lineH,
    minLineH,
    lineGap: fontPx * DETAIL_LINE_RATIO,
    top: FRAME_PAD + lineH / 2,
    bottom: height - FRAME_PAD - lineH / 2,
    edge: (side, y, own) => bandEdge(shape, parts, { y, half, own }, side),
  };
  return { frame, parts };
};

export { frameAt };
