/* @layer renderer-components @kind logic */
import { KEYBOARD_DEFAULT, buildConsoleDefaultMappings } from '@rotp/input-mapping';
import type { SdlGamepadType } from '@rotp/input-mapping';
import type { PresetMappingsParams } from './controls-settings.type';

const presetMappings = ({ sdlType, vid, pid }: PresetMappingsParams) => {
  const defaults = sdlType === 'keyboard'
    ? KEYBOARD_DEFAULT.defaultMappings
    : buildConsoleDefaultMappings({ sdlType: sdlType as SdlGamepadType, vendorId: vid, productId: pid });

  return defaults.map(m => {
    const fromDevice = m.binding.type !== 'keyboard';
    return { ...m, icon: null, sourceVid: fromDevice ? vid : null, sourcePid: fromDevice ? pid : null };
  });
};

export { presetMappings };
