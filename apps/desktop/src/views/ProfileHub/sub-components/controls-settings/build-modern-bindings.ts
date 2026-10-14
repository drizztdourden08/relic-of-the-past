/* @layer renderer-components @kind logic */
import { defaultModernBindings, keyboardModernBindings, renumberSlots } from '@rotp/input-mapping';
import { defaultLayoutIdFor } from '@rotp/hud';
import type { ResolvedControl } from '@rotp/input-mapping';
import type { ModernBindings } from '@rotp/game-data';

const baseBindings = (deviceType: 'keyboard' | 'gamepad', controls: readonly ResolvedControl[]) => {
  if (deviceType === 'keyboard') return keyboardModernBindings();
  return controls.length > 0 ? defaultModernBindings(controls) : null;
};

const buildModernBindings = (
  deviceType: 'keyboard' | 'gamepad',
  controls: readonly ResolvedControl[],
): ModernBindings | null => {
  const bindings = baseBindings(deviceType, controls);
  if (!bindings) return null;
  return {
    core: bindings.core,
    slots: renumberSlots(bindings.slots).slots,
    layoutId: defaultLayoutIdFor(deviceType),
  };
};

export { buildModernBindings };
