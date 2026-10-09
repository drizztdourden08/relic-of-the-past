/* @layer renderer-lib @kind types */
import type { ControllerGamepadType } from '@shared/ipc';

interface DeviceSnapshotFields {
  deviceKey: string;
  vendorId: number;
  productId: number;
  name?: string;
  sdlType?: ControllerGamepadType;
  hasRumble?: boolean;
}

export type { DeviceSnapshotFields };
