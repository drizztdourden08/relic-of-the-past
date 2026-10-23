/* @layer renderer-components @kind logic */
import type { PadState } from '@drizztdourden08/brock-input';
import type { OverlaySlotView, PadOverlayState } from '@app/composites/PadOverlay';
import { partStateOf } from './part-state-of';

const padToOverlayState = (pad: PadState, slots: readonly OverlaySlotView[]): PadOverlayState =>
  Object.fromEntries(slots.map((slot) => [slot.anchor, partStateOf(pad, slot)]));

export { padToOverlayState };
