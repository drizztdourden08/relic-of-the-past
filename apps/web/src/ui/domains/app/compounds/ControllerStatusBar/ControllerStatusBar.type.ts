/* @layer renderer-components @kind types */
import type { ControllerBusType, ControllerConnectionState } from '@shared/ipc';

interface ControllerStatusBarProps {
  busType?: ControllerBusType;
  connectionState?: ControllerConnectionState;
  hasRumble?: boolean;
  hasGyro?: boolean;
  idLabel?: string;
}

export type { ControllerStatusBarProps };
