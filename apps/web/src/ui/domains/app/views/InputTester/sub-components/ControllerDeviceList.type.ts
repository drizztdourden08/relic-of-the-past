/* @layer renderer-components @kind types */
import type { ControllerInputState, DeviceStickCalibration } from '../../../../../../lib/input/controller-input-store';
import type { ControllerDeviceGroup } from '../../../../../../lib/input/controller-device-groups';
import type { DeviceEntry } from '@shared/ipc';
import type { TriggerCalibrationData } from './TriggerCalibrationWizard';

interface ControllerDeviceListProps {
  groups: ControllerDeviceGroup[];
  controllerStates: Map<string, ControllerInputState>;
  stickCalibrationStore: Record<string, DeviceStickCalibration>;
  onStickCalibrationComplete: (cal: DeviceStickCalibration) => void;
  onTriggerCalibrationComplete: (deviceKey: string, axisIndex: number, cal: TriggerCalibrationData) => void;
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
