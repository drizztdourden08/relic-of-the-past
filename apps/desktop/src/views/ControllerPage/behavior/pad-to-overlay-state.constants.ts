/* @layer renderer-components @kind constants */
import type { ControllerSlotId } from '@drizztdourden08/brock-input';

const CLICK_OF: Partial<Record<ControllerSlotId, ControllerSlotId>> = {
  'stick.left': 'stick.left.click',
  'stick.right': 'stick.right.click',
};

export { CLICK_OF };
