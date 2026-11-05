/* @layer renderer-components @kind logic */
import type { ActionBinding, SdlGamepadType } from '@drizztdourden08/brock-input';
import type { PresetDevice } from '@drizztdourden08/brock-input/renderer';
import { KEYBOARD_DEFAULT, buildConsoleDefaultMappings } from '@rotp/input-mapping';
import { toBrockMappings } from './to-brock-mappings';

const presetBindings = ({ sdlType, vid, pid }: PresetDevice): ActionBinding[] => {
  const defaults = sdlType === 'keyboard'
    ? KEYBOARD_DEFAULT.defaultMappings
    : buildConsoleDefaultMappings({ sdlType: sdlType as SdlGamepadType, vendorId: vid, productId: pid });
  return toBrockMappings(defaults).map((m) => {
    const fromDevice = m.binding.type !== 'keyboard';
    return { ...m, sourceVid: fromDevice ? vid : null, sourcePid: fromDevice ? pid : null };
  });
};

export { presetBindings };
