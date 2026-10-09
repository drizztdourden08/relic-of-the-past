/* @layer renderer-components @kind logic */
import { defaultModernBindings, keyboardModernBindings, renumberSlots } from '@shared/input/scheme';
import { defaultLayoutIdFor } from '@shared/hud/layouts';
import type { ResolvedControl } from '@shared/input/family';
import type { ModernBindings } from '@rotp/game-data';

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
