/* @layer renderer-components @kind logic */
import { ASSIGNED_STATUS } from './controls.constants';

const assignedControllerStatus = (isConnected: boolean, isActivated: boolean) => {
  if (!isConnected) return ASSIGNED_STATUS.disconnected;
  return isActivated ? ASSIGNED_STATUS.connected : ASSIGNED_STATUS.detected;
};

export { assignedControllerStatus };
