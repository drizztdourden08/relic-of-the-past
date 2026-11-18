/* @layer renderer-components @kind logic */
import { claimedPositions, effectiveSlots, resolveVerbBindings } from '@drizztdourden08/brock-input';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ControlsContext } from '@drizztdourden08/brock-input/renderer';
import { coreVerbDefs } from './core-verbs.constants';
import { keyboardSlots } from './keyboard-slots';

const footerSlots = ({ profile, controls }: ControlsContext, t: I18n['t']) => {
  const keyboard = profile?.deviceType === 'keyboard';
  const defs = coreVerbDefs(t);
  const verbs = resolveVerbBindings(defs, { stored: profile?.verbs, controls, keyboard });
  const slots = effectiveSlots({
    claimed: claimedPositions(verbs, defs),
    controls,
    keyboard,
    stored: profile?.slots,
    keyboardSlots,
  });
  return { verbs, slots, hasSlotSource: controls.length > 0 || keyboard || slots.length > 0 };
};

export { footerSlots };
