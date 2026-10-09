/* @layer renderer-components @kind types */
import type { ControllerBusType, DeviceStatus } from '@shared/ipc';

interface ControllerPortRowProps {
  portNumber: number;
  status: DeviceStatus;
  busType?: ControllerBusType;
  hasRumble?: boolean;
  hasGyro?: boolean;
  liveHint?: string;
}

export type { ControllerPortRowProps };
