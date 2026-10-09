/* @layer renderer-lib @kind logic */
import type { ControllerGamepadType } from '@drizztdourden08/brock-input';
import { sdlTypesByVidPid } from './sdl-types-by-vid-pid';

const rememberControllerSdlType = (params: { vendorId: number; productId: number; sdlType: ControllerGamepadType }): void => {
  const { vendorId, productId, sdlType } = params;
  sdlTypesByVidPid.map.set(sdlTypesByVidPid.keyOf(vendorId, productId), sdlType);
};

export { rememberControllerSdlType };
