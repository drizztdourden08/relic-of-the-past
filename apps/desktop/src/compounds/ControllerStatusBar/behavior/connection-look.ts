/* @layer renderer-components @kind logic */
import type { IconifyIcon } from '@iconify/types';
import type { ControllerBusType, ControllerConnectionState } from '@drizztdourden08/brock-input';
import { BUS_ICON, BUS_LABEL, CONNECTION_ICON, CONNECTION_LABEL } from '../ControllerStatusBar.constants';
import type { ConnectionLook } from './connection-look.type';

const lookOf = (icon: IconifyIcon | null, label: string | null): ConnectionLook | null =>
  (icon && label ? { icon, label } : null);

const connectionLookOf = (busType?: ControllerBusType, connectionState?: ControllerConnectionState): ConnectionLook | null => {
  if (busType) return lookOf(BUS_ICON[busType], BUS_LABEL[busType]);
  if (connectionState) return lookOf(CONNECTION_ICON[connectionState], CONNECTION_LABEL[connectionState]);
  return null;
};

export { connectionLookOf };
