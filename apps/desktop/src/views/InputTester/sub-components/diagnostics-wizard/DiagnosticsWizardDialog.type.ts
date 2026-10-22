/* @layer renderer-components @kind types */
import type { HidControllerMap } from '../HidCalibrationWizard';

interface DiagnosticsWizardDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete?: (map: HidControllerMap) => void;
}

export type { DiagnosticsWizardDialogProps };
