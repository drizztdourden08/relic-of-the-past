/* @layer renderer-components @kind types */
import type { IconifyIcon } from '@iconify/types';
import type { ControllerBusType, ControllerConnectionState } from '@drizztdourden08/brock-input';
import type { StatusTone } from '@drizztdourden08/tessera/primitives';

interface ControllerStatusBarProps {
  busType?: ControllerBusType;
  connectionState?: ControllerConnectionState;
  hasRumble?: boolean;
  hasGyro?: boolean;
  idLabel?: string;
  detected?: boolean;
  showAbsent?: boolean;
}

interface StatusItemProps {
  icon: IconifyIcon;
  label: string;
  tone: StatusTone;
  dim?: boolean;
}

export type { ControllerStatusBarProps, StatusItemProps };
