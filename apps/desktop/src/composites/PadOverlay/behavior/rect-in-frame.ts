/* @layer renderer-components @kind logic */
import { FRAME_PAD } from '../PadOverlay.constants';
import type { OverlayFrame } from '../PadOverlay.type';
import type { Rect } from './placement.type';

const rectInFrame = (rect: Rect, frame: OverlayFrame): boolean =>
  rect.left >= FRAME_PAD && rect.top >= FRAME_PAD && rect.right <= frame.width - FRAME_PAD && rect.bottom <= frame.height - FRAME_PAD;

export { rectInFrame };
