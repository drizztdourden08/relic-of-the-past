/* @layer renderer-components @kind types */
import type { HidControllerMap } from '../HidCalibrationWizard';

interface DiagnosticsWizardProps {
  onClose: () => void;
  onComplete?: (map: HidControllerMap) => void;
  initialDeviceKey?: string | null;
}

export type { DiagnosticsWizardProps };
