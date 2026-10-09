/* @layer renderer-components @kind types */
import type { ControllerBusType, DeviceStatus } from '@drizztdourden08/brock-input';

interface ControllerPortRowProps {
  portNumber: number;
  status: DeviceStatus;
  busType?: ControllerBusType;
  hasRumble?: boolean;
  hasGyro?: boolean;
  liveHint?: string;
}

export type { ControllerPortRowProps };
