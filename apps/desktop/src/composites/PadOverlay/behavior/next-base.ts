/* @layer renderer-components @kind logic */
import { GROWN_SLACK } from '../PadOverlay.constants';
import type { OverlayMetrics } from '../PadOverlay.type';

const nextBase = (previous: OverlayMetrics | null, measured: OverlayMetrics, grownTo: number): OverlayMetrics => {
  const held = previous !== null && grownTo > 0 && measured.height <= grownTo + GROWN_SLACK;
  const height = held ? previous.height : measured.height;
  const same = previous?.width === measured.width && previous.height === height && previous.fontPx === measured.fontPx;
  return same ? previous : { ...measured, height };
};

export { nextBase };
