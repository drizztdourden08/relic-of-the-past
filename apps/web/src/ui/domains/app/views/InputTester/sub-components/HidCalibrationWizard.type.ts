/* @layer renderer-components @kind types */
import type { HidControllerMap } from './hid-calibration/hid-calibration.type';
import type { DeviceProfile } from '@shared/input';
import type { DeviceEntry } from '@shared/ipc';

interface HidCalibrationWizardProps {
  onComplete: (map: HidControllerMap) => void;
  onCancel: () => void;
  deviceKey?: string;
  /** Suppresses the wizard's own Copy/Finish/Cancel row for a host that renders its own (see HidWizardHandle). */
  hideOwnActions?: boolean;
  /** Fires whenever capturedCount changes, so a hideOwnActions host can drive its own Finish button. */
  onCapturedCountChange?: (count: number) => void;
  /** A layout already read from the live device, used as-is: a released device can no longer be asked. */
  initialProfile?: DeviceProfile | null;
  /** The device entry that layout was read from, for the report's identity fields. */
  capturedEntry?: DeviceEntry | null;
  /** Skips the profile picker and starts live calibration against this profile id. */
  initialProfileId?: string;
  /** Paired with initialProfileId: whether the device reports a gyro. Ignored when initialProfileId is unset. */
  initialHasGyro?: boolean;
}

/** Imperative surface for a hideOwnActions host: the actions the wizard's own header row would expose. */
interface HidWizardHandle {
  /** Resolves true on success, false on failure (e.g. clipboard write denied). */
  copyJson: () => Promise<boolean>;
  finish: () => void;
}

export type { HidCalibrationWizardProps, HidWizardHandle };
