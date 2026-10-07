/* @layer renderer-components @kind logic */
/**
 * The modern bindings a profile starts with, for the device it is assigned to.
 *
 * One entry point for the two callers that need it, which are dropping a controller
 * onto a profile while the modern scheme is active and switching a profile to the
 * modern scheme for the first time. The two can never disagree about what
 * a fresh modern profile looks like.
 *
 * Returns null when there is nothing to build from: a gamepad profile whose
 * device has never been seen (no live capabilities, no remembered SDL type)
 * has no control list, and inventing one would fabricate buttons the pad may
 * not have.
 *
 * IT PREFILLS TWO THINGS, and they are written together on purpose: the slot
 * list, and the HUD LAYOUT this scheme wears. A dropped controller that got a
 * slot list but no layout would have working buttons with nowhere on screen to
 * see them, so the two halves of the join are seeded in one place.
 *
 * What lands on disk is a PREFILL, and from that moment it IS the slot list:
 * every reader reads it back as written (`effectiveSlots`), and the player adds
 * to it, removes from it and re-binds it on the controls screen. Nothing
 * re-derives it behind them. That is what makes the list open-ended, and it is
 * the reversal contract §19 records.
 */
import { defaultModernBindings, keyboardModernBindings, renumberSlots } from '@shared/input/scheme';
import { defaultLayoutIdFor } from '@shared/hud/layouts';
import type { ResolvedControl } from '@shared/input/family';
import type { ModernBindings } from '@shared/types/controls';

const buildModernBindings = (
  deviceType: 'keyboard' | 'gamepad',
  controls: readonly ResolvedControl[],
): ModernBindings | null => {
  const bindings = deviceType === 'keyboard'
    ? keyboardModernBindings()
    : controls.length > 0 ? defaultModernBindings(controls) : null;
  if (!bindings) return null;
  return {
    core: bindings.core,
    slots: renumberSlots(bindings.slots).slots,
    layoutId: defaultLayoutIdFor(deviceType),
  };
};

export { buildModernBindings };
