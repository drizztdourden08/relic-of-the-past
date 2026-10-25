/* @layer renderer-components @kind logic */
import { FRAME_PAD } from '../PadOverlay.constants';
import type { FitInput } from './placement.type';

const topScale = ({ bounds, metrics }: FitInput): number =>
  Math.min((metrics.width - FRAME_PAD * 2) / bounds.w, (metrics.height - FRAME_PAD * 2) / bounds.h);

export { topScale };
