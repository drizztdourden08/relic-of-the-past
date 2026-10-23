/* @layer renderer-components @kind logic */
import type { PadState } from '@drizztdourden08/brock-input';
import type { OverlaySlotView, PartState } from '@app/composites/PadOverlay';
import { analogPartState } from './analog-part-state';
import { dpadStateOf } from './dpad-state-of';
import { stickPartState } from './stick-part-state';

const partStateOf = (pad: PadState, slot: OverlaySlotView): PartState => {
  if (slot.kind === 'dpad') return { dpad: dpadStateOf(pad) };
  if (slot.kind === 'stick') return stickPartState(pad, slot.anchor);
  if (slot.kind === 'analog') return analogPartState(pad, slot.anchor);
  return { pressed: Boolean(pad.slots[slot.anchor]?.pressed) };
};

export { partStateOf };
