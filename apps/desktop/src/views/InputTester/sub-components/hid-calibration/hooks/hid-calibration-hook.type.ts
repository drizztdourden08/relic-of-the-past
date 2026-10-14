/* @layer renderer-components @kind types */
import type { DeviceProfile } from '@rotp/input-mapping';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { ByteStatus, HidControllerMap, Phase } from '../hid-calibration.type';
import type { CalibrationRefs } from './report-subscription.type';
import type { useCalibrationItemState } from './useCalibrationItemState';
import type { useGyroIdleState } from './useGyroIdleState';

interface UseHidCalibrationProps {
  onComplete: (map: HidControllerMap) => void;
  onCancel: () => void;
  deviceKey?: string;
  initialProfile?: DeviceProfile | null;
  capturedEntry?: DeviceEntry | null;
  initialProfileId?: string;
  initialHasGyro?: boolean;
}

interface UseDeviceAutoDetectParams {
  addLog: (msg: string) => void;
  initialProfileId?: string;
  initialHasGyro?: boolean;
  deviceKey?: string;
  initialProfile?: DeviceProfile | null;
}

interface UseDoAdvanceParams {
  refs: CalibrationRefs;
  itemState: ReturnType<typeof useCalibrationItemState>;
  addLog: (msg: string) => void;
}

interface UseCalibrationBootstrapParams {
  phase: Phase;
  deviceKey?: string;
  detectedProfile: DeviceProfile | null;
  handleProfileConfirm: () => void;
  deviceInfoRef: CalibrationRefs['deviceInfoRef'];
}

interface WizardGettersParams {
  itemState: ReturnType<typeof useCalibrationItemState>;
  byteStatuses: ByteStatus[];
  gyroIdle: ReturnType<typeof useGyroIdleState>;
}

export type { UseCalibrationBootstrapParams, UseDeviceAutoDetectParams, UseDoAdvanceParams, UseHidCalibrationProps, WizardGettersParams };
