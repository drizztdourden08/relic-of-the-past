/* @layer renderer-components @kind logic */
import { buildDisplayContext, resolveBrandLogoKey } from '@rotp/input-mapping';
import type { SdlGamepadType } from '@rotp/input-mapping';
import type { DeviceFamily } from '@rotp/game-data';

const presetDeviceFamily = (sdlType: string): DeviceFamily => {
  if (sdlType === 'keyboard') return 'keyboard';
  return (resolveBrandLogoKey(buildDisplayContext({ sdlType: sdlType as SdlGamepadType })) || 'generic') as DeviceFamily;
};

export { presetDeviceFamily };
