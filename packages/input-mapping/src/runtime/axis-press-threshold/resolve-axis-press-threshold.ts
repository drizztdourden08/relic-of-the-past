/* @layer renderer-lib @kind logic */
import { buildDisplayContext, recallControllerSdlType, resolveTriggerPressThreshold } from '@drizztdourden08/brock-input';
import type { SdlGamepadType } from '@rotp/game-data';
import { STICK_DIRECTION_PRESS_THRESHOLD, TRIGGER_AXIS_INDICES } from './axis-press-threshold.constants';

const sdlTypeForDeviceKey = (deviceKey: string): SdlGamepadType | null => {
  const [vidStr, pidStr] = deviceKey.split(':');
  if (!vidStr || !pidStr) return null;
  const vendorId = parseInt(vidStr, 16);
  const productId = parseInt(pidStr, 16);
  if (Number.isNaN(vendorId) || Number.isNaN(productId)) return null;
  return recallControllerSdlType(vendorId, productId);
};

const resolveAxisPressThreshold = (axisIndex: number, deviceKey: string): number => {
  if (!TRIGGER_AXIS_INDICES.includes(axisIndex)) return STICK_DIRECTION_PRESS_THRESHOLD;
  const sdlType = sdlTypeForDeviceKey(deviceKey) ?? 'unknown';
  return resolveTriggerPressThreshold(buildDisplayContext({ sdlType }));
};

export { resolveAxisPressThreshold };
