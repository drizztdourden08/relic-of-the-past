/* @layer renderer-components @kind types */
import type { FlashStatus } from '../hooks/flash-status.type';

interface WizardHeaderActionsProps {
  copyStatus: FlashStatus;
  saveStatus: FlashStatus;
  capturedCount: number;
  onCopyJson: () => void;
  onSaveDebugFile: () => void;
  onFinish: () => void;
  onCancel: () => void;
}

export type { WizardHeaderActionsProps };
