/* @layer renderer-components @kind types */
import type { HidControllerMap } from './hid-calibration/hid-calibration.type';

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
}

/** Imperative surface for a host rendering hideOwnActions — the same actions the
 *  wizard's own header row would otherwise expose as buttons. */
interface HidWizardHandle {
  /** Resolves true on success, false on failure (e.g. clipboard write denied). */
  copyJson: () => Promise<boolean>;
  finish: () => void;
}

export type { HidCalibrationWizardProps, HidWizardHandle };
