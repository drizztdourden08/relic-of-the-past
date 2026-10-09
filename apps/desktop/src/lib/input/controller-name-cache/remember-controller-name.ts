/* @layer renderer-lib @kind logic */
import { controllerNames } from './controller-names';

const rememberControllerName = (params: { deviceKey: string; vendorId: number; productId: number; name: string }): void => {
  const { deviceKey, vendorId, productId, name } = params;
  const trimmed = name.trim();
  if (!trimmed) return;
  controllerNames.byDeviceKey.set(deviceKey, trimmed);
  controllerNames.byVidPid.set(controllerNames.vidPidKey(vendorId, productId), trimmed);
};

export { rememberControllerName };
