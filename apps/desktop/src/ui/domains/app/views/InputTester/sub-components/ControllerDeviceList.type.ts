/* @layer renderer-components @kind types */
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { ControllerInputState } from '../../../../../../lib/input/controller-input-store';

interface ControllerDeviceListProps {
  entries: readonly DeviceEntry[];
  controllerStates: Map<string, ControllerInputState>;
  onReportDevice: (deviceKey: string) => void;
}

export type { ControllerDeviceListProps };
