/* @layer renderer-lib @kind logic */
import { controllerNames } from './controller-names';

const recallControllerName = (params: { deviceKey?: string; vendorId?: number; productId?: number }): string | null => {
  const { deviceKey, vendorId, productId } = params;
  if (deviceKey) {
    const hit = controllerNames.byDeviceKey.get(deviceKey);
    if (hit) return hit;
  }
  if (vendorId != null && productId != null) {
    return controllerNames.byVidPid.get(controllerNames.vidPidKey(vendorId, productId)) ?? null;
  }
  return null;
};

export { recallControllerName };
