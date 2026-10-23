/* @layer renderer-components @kind logic */
import type { ControllerSlotId, PadState } from '@drizztdourden08/brock-input';
import type { PartState } from '@app/composites/PadOverlay';

const analogPartState = (pad: PadState, anchor: ControllerSlotId): PartState => {
  const value = pad.slots[anchor]?.value ?? 0;
  return { value, pressed: value > 0 };
};

export { analogPartState };
