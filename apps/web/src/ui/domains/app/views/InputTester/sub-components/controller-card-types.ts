/* @layer renderer-components @kind types */
import type { ControllerInputState, DeviceStickCalibration } from '../../../../../../lib/input/controller-input-store';
import type { ResolvedDevice } from '@shared/input/family';
import type { ControllerBusType } from '@shared/ipc';
import type { TriggerCalibrationData } from './TriggerCalibrationWizard';

interface ControllerCardProps {
  deviceKey: string;
  state: ControllerInputState;
  resolvedDevice: ResolvedDevice;
  hasStickCal?: boolean;
  existingStickCal?: DeviceStickCalibration | null;
  /** Reported directly by SDL3 (controller:added / the device snapshot) —
   *  undefined when this card was built without a snapshot entry. */
  busType?: ControllerBusType;
  hasRumble?: boolean;
  /** Raised rather than handled here: the report releases SDL partway
   *  through, which drops this device out of the ready list and unmounts
   *  its card. A dialog owned by the card would go with it. */
  onReportDevice?: (deviceKey: string) => void;
  hasGyro?: boolean;
  onStickCalibrationComplete?: (cal: DeviceStickCalibration) => void;
  onTriggerCalibrationComplete?: (axisIndex: number, cal: TriggerCalibrationData) => void;
}

/** What's being calibrated — null means nothing open */
type CalibrationTarget =
  | { type: 'stick'; side: 'left' | 'right' | 'both' }
  | { type: 'trigger'; axisIndex: number; label: string }
  | null;

export type { ControllerCardProps, CalibrationTarget };
