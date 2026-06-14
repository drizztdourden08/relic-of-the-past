/* @layer renderer-components @kind types */
import type { WebHidInputState, DeviceStickCalibration } from '../../../../../../lib/input/hid-reader';
import type { DEVICE_PROFILES } from '@shared/input';
import type { TriggerCalibrationData } from './TriggerCalibrationWizard';

interface WebHidCardProps {
  deviceKey: string;
  state: WebHidInputState;
  profile: (typeof DEVICE_PROFILES)[number] | null;
  hasStickCal?: boolean;
  existingStickCal?: DeviceStickCalibration | null;
  onStickCalibrationComplete?: (cal: DeviceStickCalibration) => void;
  onTriggerCalibrationComplete?: (axisIndex: number, cal: TriggerCalibrationData) => void;
}

/** What's being calibrated — null means nothing open */
type CalibrationTarget =
  | { type: 'stick'; side: 'left' | 'right' | 'both' }
  | { type: 'trigger'; axisIndex: number; label: string }
  | null;

export type { WebHidCardProps, CalibrationTarget };
