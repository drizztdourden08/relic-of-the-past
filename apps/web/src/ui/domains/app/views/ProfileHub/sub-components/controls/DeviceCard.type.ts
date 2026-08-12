/* @layer renderer-components @kind types */
import type { DeviceFamily } from '@shared/types/controls';
import type { ControllerBusType, DeviceStatus } from '@shared/ipc';

interface DeviceAssignInfo {
  sdlType: string | null;
  displayName: string;
  vendorId: string | null;
  productId: string | null;
}

interface DeviceCardProps {
  id: string;
  displayName: string;
  deviceFamily: DeviceFamily;
  sdlType: string | null;
  vendorId: string | null;
  productId: string | null;
  status: DeviceStatus;
  busType?: ControllerBusType;
  hasRumble?: boolean;
  hasGyro?: boolean;
  onAssign?: (device: DeviceAssignInfo) => void;
  /** Only rendered when `status` is 'unavailable'. */
  onAddMapping?: (mapping: string) => Promise<boolean>;
}

export type { DeviceAssignInfo, DeviceCardProps };
