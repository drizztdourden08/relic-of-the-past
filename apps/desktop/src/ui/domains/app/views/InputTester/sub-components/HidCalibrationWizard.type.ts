/* @layer renderer-components @kind types */
import type { HidControllerMap } from './hid-calibration/hid-calibration.type';
import type { DeviceProfile } from '@rotp/input-mapping';
import type { DeviceEntry } from '@drizztdourden08/brock-input';

interface HidCalibrationWizardProps {
  onComplete: (map: HidControllerMap) => void;
  onCancel: () => void;
  deviceKey?: string;
  hideOwnActions?: boolean;
  onCapturedCountChange?: (count: number) => void;
  initialProfile?: DeviceProfile | null;
  capturedEntry?: DeviceEntry | null;
  initialProfileId?: string;
  initialHasGyro?: boolean;
}

interface HidWizardHandle {
  copyJson: () => Promise<boolean>;
  finish: () => void;
}

export type { HidCalibrationWizardProps, HidWizardHandle };
