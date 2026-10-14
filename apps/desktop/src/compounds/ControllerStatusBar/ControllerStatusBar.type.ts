/* @layer renderer-components @kind types */
import type { IconifyIcon } from '@iconify/types';
import type { ControllerBusType, ControllerConnectionState } from '@drizztdourden08/brock-input';

interface ControllerStatusBarProps {
  busType?: ControllerBusType;
  connectionState?: ControllerConnectionState;
  hasRumble?: boolean;
  hasGyro?: boolean;
  idLabel?: string;
}

interface StatusItemProps {
  icon: IconifyIcon;
  label: string;
}

export type { ControllerStatusBarProps, StatusItemProps };
