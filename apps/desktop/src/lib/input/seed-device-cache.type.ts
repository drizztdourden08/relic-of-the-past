/* @layer renderer-lib @kind types */
import type { ControllerGamepadType } from '@drizztdourden08/brock-input';

interface DeviceSnapshotFields {
  deviceKey: string;
  vendorId: number;
  productId: number;
  name?: string;
  sdlType?: ControllerGamepadType;
  hasRumble?: boolean;
}

export type { DeviceSnapshotFields };
