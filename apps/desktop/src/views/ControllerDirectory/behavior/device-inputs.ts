/* @layer renderer-components @kind logic */
import type { DeviceEntry } from '@drizztdourden08/brock-input';

const deviceInputs = (device: DeviceEntry): number =>
  [...(device.hasButton ?? []), ...(device.hasAxis ?? [])].filter(Boolean).length;

export { deviceInputs };
