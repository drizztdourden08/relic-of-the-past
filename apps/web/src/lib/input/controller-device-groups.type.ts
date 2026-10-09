/* @layer renderer-lib @kind types */
import type { DeviceEntry } from '@shared/ipc';

interface ControllerPort {
  deviceKey: string;
  portNumber: number;
  entry: DeviceEntry;
}

interface ControllerDeviceGroup {
  vendorId: number;
  productId: number;
  product: string;
  busType: DeviceEntry['busType'];
  isAdapter: boolean;
  ports: ControllerPort[];
}

export type { ControllerDeviceGroup, ControllerPort };
