/* @layer renderer-components @kind types */
import type { DeviceProfile } from '@shared/input';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { HidControllerMap } from '../hid-calibration.type';

interface UseHidCalibrationProps {
  onComplete: (map: HidControllerMap) => void;
  onCancel: () => void;
  deviceKey?: string;
  initialProfile?: DeviceProfile | null;
  capturedEntry?: DeviceEntry | null;
  initialProfileId?: string;
  initialHasGyro?: boolean;
}

export type { UseHidCalibrationProps };
