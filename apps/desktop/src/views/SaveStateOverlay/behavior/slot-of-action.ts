/* @layer renderer-components @kind logic */
import { SLOT_ACTION_PATTERN } from './slot-of-action.constants';

const slotOfAction = (action: string): number | undefined => {
  const digits = SLOT_ACTION_PATTERN.exec(action)?.[1];
  return digits === undefined ? undefined : parseInt(digits, 10) - 1;
};

export { slotOfAction };
