/* @layer renderer-components @kind types */
import type { ControllerBusType, DeviceStatus } from '@shared/ipc';

interface ControllerPortRowProps {
  portNumber: number;
  status: DeviceStatus;
  busType?: ControllerBusType;
  hasRumble?: boolean;
  hasGyro?: boolean;
  /** Short live proof-of-life text for a ready port, e.g. a button/axis count. */
  liveHint?: string;
}

export type { ControllerPortRowProps };
