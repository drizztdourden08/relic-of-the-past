/* @layer renderer-components @kind types */
import type { HidControllerMap } from '../HidCalibrationWizard';

interface DiagnosticsWizardDialogProps {
  open: boolean;
  onClose: () => void;
  /** Fired when the dialog closes with a byte capture on hand, mirroring what
   *  the standalone HidCalibrationWizard's own onComplete used to report. */
  onComplete?: (map: HidControllerMap) => void;
}

export type { DiagnosticsWizardDialogProps };
