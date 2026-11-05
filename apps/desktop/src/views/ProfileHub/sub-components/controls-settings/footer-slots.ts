/* @layer renderer-components @kind logic */
import { claimedPositions, effectiveSlots, resolveVerbBindings } from '@drizztdourden08/brock-input';
import type { ControlsContext } from '@drizztdourden08/brock-input/renderer';
import { CORE_VERB_DEFS } from './core-verbs.constants';
import { keyboardSlots } from './keyboard-slots';

const footerSlots = ({ profile, controls }: ControlsContext) => {
  const keyboard = profile?.deviceType === 'keyboard';
  const verbs = resolveVerbBindings(CORE_VERB_DEFS, { stored: profile?.verbs, controls, keyboard });
  const slots = effectiveSlots({
    claimed: claimedPositions(verbs, CORE_VERB_DEFS),
    controls,
    keyboard,
    stored: profile?.slots,
    keyboardSlots,
  });
  return { verbs, slots, hasSlotSource: controls.length > 0 || keyboard || slots.length > 0 };
};

export { footerSlots };
