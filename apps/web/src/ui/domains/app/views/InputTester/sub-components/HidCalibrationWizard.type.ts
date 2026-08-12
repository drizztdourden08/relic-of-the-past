/* @layer renderer-components @kind types */
import type { HidControllerMap } from './hid-calibration/hid-calibration.type';
import type { DeviceProfile } from '@shared/input';
import type { DeviceEntry } from '@shared/ipc';

interface HidCalibrationWizardProps {
  onComplete: (map: HidControllerMap) => void;
  onCancel: () => void;
  deviceKey?: string;
  /** Suppresses the wizard's own Copy/Finish/Cancel row — for a host that renders
   *  those as its own persistent step-navigation buttons instead (see HidWizardHandle). */
  hideOwnActions?: boolean;
  /** Fires whenever capturedCount changes, so a host with hideOwnActions can drive
   *  its own "Finish"-equivalent button's disabled state. */
  onCapturedCountChange?: (count: number) => void;
  /** Skips the built-in profile-picker screen and starts live calibration
   *  immediately against this profile id, for a host that already resolved
   *  the device and profile itself (see the diagnostics wizard's choose-a-
   *  controller step). Leaving this unset keeps the picker screen exactly
   *  as it is for a host that hasn't resolved a profile yet. */
  /** A layout already read from the live device. When given it is used as-is,
   *  since a released device can no longer be asked. */
  initialProfile?: DeviceProfile | null;
  /** The device entry that layout was read from, for the report's identity fields. */
  capturedEntry?: DeviceEntry | null;
  initialProfileId?: string;
  /** Paired with initialProfileId: whether the resolved device reports a
   *  gyro, so the prereq step knows whether to ask for one. Ignored when
   *  initialProfileId is unset. */
  initialHasGyro?: boolean;
}

/** Imperative surface for a host rendering hideOwnActions — the same actions the
 *  wizard's own header row would otherwise expose as buttons. */
interface HidWizardHandle {
  /** Resolves true on success, false on failure (e.g. clipboard write denied). */
  copyJson: () => Promise<boolean>;
  finish: () => void;
}

export type { HidCalibrationWizardProps, HidWizardHandle };
