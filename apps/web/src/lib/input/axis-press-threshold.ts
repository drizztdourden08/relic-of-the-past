/* @layer renderer-lib @kind logic */
/**
 * Single place where a raw axis reading crosses into "pressed", shared by
 * live play (the SNES bitmask, function-action hotkeys) and by capturing a
 * fresh binding (the raw input dispatcher). A trigger axis (SDL's fixed
 * LEFT_TRIGGER/RIGHT_TRIGGER indices) crosses through the same
 * family-overridable threshold the calibration screen already shows a
 * trigger through (see shared/input/family/live-control-state.ts and
 * resolve-display.ts's resolveTriggerPressThreshold), never a second,
 * disconnected number. Any other axis, such as a stick standing in for a
 * directional button, keeps the plain deflection threshold below, since it
 * never carries a trigger press threshold at all.
 */
import { buildDisplayContext, resolveTriggerPressThreshold } from '@shared/input/family';
import type { SdlGamepadType } from '@shared/input/family';
import { SDL_AXIS } from '@shared/input/sdl-buttons';
import { recallControllerSdlType } from './controller-family-cache';

/** Deflection a non-trigger axis must cross to count as pressed. Unrelated
 *  to trigger feel, so it never routes through the family layer. */
const STICK_DIRECTION_PRESS_THRESHOLD = 0.5;

const TRIGGER_AXIS_INDICES: readonly number[] = [SDL_AXIS.LEFT_TRIGGER, SDL_AXIS.RIGHT_TRIGGER];

/** "vid:pid" (hex, as carried by every hidStates/deviceKey in this layer) →
 *  the SDL type recorded for it this session, or null if never seen. */
const sdlTypeForDeviceKey = (deviceKey: string): SdlGamepadType | null => {
  const [vidStr, pidStr] = deviceKey.split(':');
  if (!vidStr || !pidStr) return null;
  const vendorId = parseInt(vidStr, 16);
  const productId = parseInt(pidStr, 16);
  if (Number.isNaN(vendorId) || Number.isNaN(productId)) return null;
  return recallControllerSdlType(vendorId, productId);
};

/**
 * How far this axis index must travel before it counts as pressed for
 * `deviceKey`. Falls back to the generic (family-less) trigger threshold
 * when the device's SDL type has not been recorded yet this session.
 */
const resolveAxisPressThreshold = (axisIndex: number, deviceKey: string): number => {
  if (!TRIGGER_AXIS_INDICES.includes(axisIndex)) return STICK_DIRECTION_PRESS_THRESHOLD;
  const sdlType = sdlTypeForDeviceKey(deviceKey) ?? 'unknown';
  return resolveTriggerPressThreshold(buildDisplayContext({ sdlType }));
};

export { resolveAxisPressThreshold, STICK_DIRECTION_PRESS_THRESHOLD };
