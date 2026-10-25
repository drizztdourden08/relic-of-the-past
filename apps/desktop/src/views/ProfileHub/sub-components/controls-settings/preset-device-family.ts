/* @layer renderer-components @kind logic */
import { buildDisplayContext, resolveBrandLogoKey } from '@drizztdourden08/brock-input';
import type { SdlGamepadType } from '@drizztdourden08/brock-input';
import type { DeviceFamily } from '@rotp/game-data';

const presetDeviceFamily = (sdlType: string): DeviceFamily => {
  if (sdlType === 'keyboard') return 'keyboard';
  return (resolveBrandLogoKey(buildDisplayContext({ sdlType: sdlType as SdlGamepadType })) || 'generic') as DeviceFamily;
};

export { presetDeviceFamily };
