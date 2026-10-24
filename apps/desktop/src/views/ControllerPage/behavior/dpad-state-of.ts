/* @layer renderer-components @kind logic */
import type { PadState } from '@drizztdourden08/brock-input';
import type { DpadPressState } from '@app/composites/DpadCross';

const dpadStateOf = (pad: PadState): DpadPressState => ({
  up: Boolean(pad.slots['dpad.up']?.pressed),
  right: Boolean(pad.slots['dpad.right']?.pressed),
  down: Boolean(pad.slots['dpad.down']?.pressed),
  left: Boolean(pad.slots['dpad.left']?.pressed),
});

export { dpadStateOf };
