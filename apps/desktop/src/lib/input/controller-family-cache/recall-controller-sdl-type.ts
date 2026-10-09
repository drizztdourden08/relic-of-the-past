/* @layer renderer-lib @kind logic */
import type { ControllerGamepadType } from '@drizztdourden08/brock-input';
import { sdlTypesByVidPid } from './sdl-types-by-vid-pid';

const recallControllerSdlType = (vendorId: number, productId: number): ControllerGamepadType | null =>
  sdlTypesByVidPid.map.get(sdlTypesByVidPid.keyOf(vendorId, productId)) ?? null;

export { recallControllerSdlType };
