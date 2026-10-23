/* @layer renderer-components @kind logic */
import { DIRECTION_NAMES } from '../PadOverlay.constants';
import type { PartState } from '../PadOverlay.type';

const describeDpad = (state: PartState | undefined): string | undefined => {
  const down = Object.entries(state?.dpad ?? {})
    .filter(([, pressed]) => pressed)
    .map(([direction]) => DIRECTION_NAMES[direction as keyof typeof DIRECTION_NAMES]);
  return down.length > 0 ? down.join(' + ') : undefined;
};

export { describeDpad };
