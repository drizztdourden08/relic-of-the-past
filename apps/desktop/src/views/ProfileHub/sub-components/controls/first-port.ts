/* @layer renderer-components @kind logic */
import type { ControllerDeviceGroup } from '@rotp/input-mapping';

const firstPort = (group: ControllerDeviceGroup): ControllerDeviceGroup['ports'][number] => {
  const [port] = group.ports;
  if (!port) throw new Error(`controller group ${group.vendorId}:${group.productId} has no port`);
  return port;
};

export { firstPort };
