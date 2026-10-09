/* @layer renderer-components @kind types */
import type { ControllerBusType, ControllerConnectionState } from '@drizztdourden08/brock-input';

interface ControllerStatusBarProps {
  busType?: ControllerBusType;
  connectionState?: ControllerConnectionState;
  hasRumble?: boolean;
  hasGyro?: boolean;
  idLabel?: string;
}

export type { ControllerStatusBarProps };
