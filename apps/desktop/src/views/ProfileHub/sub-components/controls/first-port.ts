/* @layer renderer-components @kind logic */
import type { ControllerDeviceGroup } from '@drizztdourden08/brock-input/renderer';

const firstPort = (group: ControllerDeviceGroup): ControllerDeviceGroup['ports'][number] => {
  const [port] = group.ports;
  if (!port) throw new Error(`controller group ${group.vendorId}:${group.productId} has no port`);
  return port;
};

export { firstPort };
