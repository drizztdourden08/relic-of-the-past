/* @layer renderer-components @kind logic */
import type { ChooserDevice } from '../diagnostics-wizard.type';

const pickDeviceKey = (chooserDevices: readonly ChooserDevice[], initialDeviceKey: string | null | undefined): string | null => {
  if (initialDeviceKey && chooserDevices.some((d) => d.deviceKey === initialDeviceKey)) return initialDeviceKey;
  return chooserDevices[0]?.deviceKey ?? null;
};

export { pickDeviceKey };
