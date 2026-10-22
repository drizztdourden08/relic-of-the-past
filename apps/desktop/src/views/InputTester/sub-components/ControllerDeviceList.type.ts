/* @layer renderer-components @kind types */
import type { DeviceEntry, DeviceStickCalibration, TriggerCalibration } from '@drizztdourden08/brock-input';
import type { ControllerDeviceGroup } from '@rotp/input-mapping';
import type { ControllerInputState } from '../../../input/controller-input-store';

interface ControllerDeviceListProps {
  groups: ControllerDeviceGroup[];
  controllerStates: Map<string, ControllerInputState>;
  stickCalibrationStore: Record<string, DeviceStickCalibration>;
  onStickCalibrationComplete: (cal: DeviceStickCalibration) => void;
  onTriggerCalibrationComplete: (deviceKey: string, axisIndex: number, cal: TriggerCalibration) => void;
  onAddMapping: (mapping: string) => Promise<boolean>;
  onReportDevice: (deviceKey: string) => void;
}

interface AdapterControllerCardProps {
  group: ControllerDeviceGroup;
  controllerStates: Map<string, ControllerInputState>;
  onAddMapping: (mapping: string) => Promise<boolean>;
}

interface UnavailableControllerCardProps {
  entry: DeviceEntry;
  onAddMapping: (mapping: string) => Promise<boolean>;
}

export type { AdapterControllerCardProps, ControllerDeviceListProps, UnavailableControllerCardProps };
