/* @layer shared-input @kind logic */
import { resolveDeviceFromEntry } from '@drizztdourden08/brock-input';
import type { CoreBindings, InputBinding } from '@rotp/game-data';
import { buildConsoleDefaultMappings } from '../../build-console-defaults';
import { TOUCH_DEVICE_ENTRY } from '../../runtime/touch-pad/touch-pad.constants';
import { defaultModernBindings } from '../../scheme/default-modern-bindings/default-modern-bindings';
import { UNBOUND } from '../../scheme/default-modern-bindings/default-modern-bindings.constants';
import { renumberSlots } from '../../scheme/slot-list/renumber-slots';
import type { TouchBindTarget } from './touch-bind-target.type';

const touchDefaultBinding = (target: TouchBindTarget): InputBinding => {
  if (target.kind === 'classic') {
    const mapping = buildConsoleDefaultMappings({ sdlType: 'switch-pro' }).find((m) => m.snesButton === target.id);
    return mapping?.binding ?? UNBOUND;
  }
  const modern = defaultModernBindings(resolveDeviceFromEntry(TOUCH_DEVICE_ENTRY).controls);
  if (target.kind === 'verb') return target.id in modern.core ? modern.core[target.id as keyof CoreBindings] : UNBOUND;
  return renumberSlots(modern.slots).slots.find((slot) => slot.index === target.index)?.binding ?? UNBOUND;
};

export { touchDefaultBinding };
