/* @layer renderer-components @kind component */
import { useCallback, useRef, useState } from 'react';
import { WizardDialog } from '@drizztdourden08/tessera/composites';
import { Box, Button } from '@drizztdourden08/tessera/primitives';
import type { HidWizardHandle } from '../HidCalibrationWizard';
import { useDiagnosticsWizardState } from './behavior/useDiagnosticsWizardState';
import { useDiagnosticsTesseraWizard } from './behavior/useDiagnosticsTesseraWizard';
import { useSummaryExport } from './behavior/useSummaryExport';
import { useFlashStatus } from '../hid-calibration/hooks/useFlashStatus';
import { COPY_LABELS, SAVE_LABELS } from './diagnostics-wizard.constants';
import { DiagnosticsFlowBody } from './DiagnosticsFlowBody';
import type { DiagnosticsWizardDialogProps } from './DiagnosticsWizardDialog.type';
import './DiagnosticsWizardDialog.css';

const DiagnosticsWizardDialog = (props: DiagnosticsWizardDialogProps) => {
  const { open, onClose, onComplete } = props;
  const wizard = useDiagnosticsWizardState({ open, onComplete });
  const wizardRef = useRef<HidWizardHandle>(null);
  const [capturedCount, setCapturedCount] = useState(0);
  const { handleCopyJson, handleSaveToDisk } = useSummaryExport(wizard.byteCapture, wizard.positionalRecords);
  const [copyStatus, flashCopy] = useFlashStatus();
  const [saveStatus, flashSave] = useFlashStatus();
  const handleClose = useCallback(() => wizard.finishAndClose(onClose), [wizard.finishAndClose, onClose]);
  const handleByteCaptureNext = useCallback(() => {
    wizardRef.current?.finish();
    wizard.goNext();
  }, [wizard.goNext]);
  const handleSave = useCallback(() => handleSaveToDisk().then(flashSave), [handleSaveToDisk, flashSave]);
  const handleCopy = useCallback(() => handleCopyJson().then(flashCopy), [handleCopyJson, flashCopy]);

  const tesseraWizard = useDiagnosticsTesseraWizard(wizard, capturedCount, handleByteCaptureNext, handleClose);
  if (tesseraWizard === null) return null;

  const summaryActions = (
    <Box className="diagnostics-wizard__summary-actions">
      <Button variant="secondary" onClick={wizard.restart}>Restart on another controller</Button>
      <Button variant="tertiary" onClick={() => { void handleSave(); }}>{SAVE_LABELS[saveStatus]}</Button>
      <Button variant="tertiary" onClick={() => { void handleCopy(); }}>{COPY_LABELS[copyStatus]}</Button>
    </Box>
  );

  return (
    <WizardDialog
      wizard={tesseraWizard}
      open={open}
      title="Gamepad diagnostics"
      onExit={handleClose}
      className="diagnostics-wizard"
    >
      <DiagnosticsFlowBody
        wizard={wizard}
        wizardRef={wizardRef}
        onCapturedCountChange={setCapturedCount}
        summaryActions={summaryActions}
      />
    </WizardDialog>
  );
};

export { DiagnosticsWizardDialog };
