/* @layer renderer-components @kind component */
/**
 * The gamepad diagnostics run as a modal wizard: an intro that shuts SDL's
 * gamepad backend down (step 1), picking a detected controller from the
 * union chooser-devices.ts builds (step 2), a byte-level capture reusing the
 * restored HidCalibrationWizard capture body for a byte-capable device only
 * (step 3), a one-by-one positional re-capture after the hold is restored
 * (step 4), and a side-by-side summary (step 5). Not dismissable by
 * backdrop click, Escape, or the close button while a run is in progress,
 * since this wizard owns whether SDL is up or down. The only way out is the
 * explicit Cancel/Restart/Close actions in its own footer, which always
 * restore the hold. Chrome follows the same DialogShell + StepIndicator
 * pattern as ControllerReportDialog, reusing that exact StepIndicator.
 */
import { useRef, useState } from 'react';
import { DialogShell } from '@ds/composites/DialogShell';
import { Button } from '@ds/primitives';
import type { HidWizardHandle } from '../HidCalibrationWizard';
import { StepIndicator } from '../controller-report/sub-components/StepIndicator';
import { useDiagnosticsWizardState } from './behavior/useDiagnosticsWizardState';
import { useSummaryExport } from './behavior/useSummaryExport';
import { useFlashStatus } from '../hid-calibration/hooks/useFlashStatus';
import { DiagnosticsFlowBody } from './DiagnosticsFlowBody';
import { DiagnosticsStepActions } from './sub-components/DiagnosticsStepActions';
import type { DiagnosticsWizardDialogProps } from './DiagnosticsWizardDialog.type';
import '../controller-report/ControllerReportDialog.css';
import './DiagnosticsWizardDialog.css';

const DiagnosticsWizardDialog = (props: DiagnosticsWizardDialogProps) => {
  const { open, onClose, onComplete } = props;
  const wizard = useDiagnosticsWizardState({ open, onComplete });
  const wizardRef = useRef<HidWizardHandle>(null);
  const [capturedCount, setCapturedCount] = useState(0);
  const { handleCopyJson, handleSaveToDisk } = useSummaryExport(wizard.byteCapture, wizard.positionalRecords);
  const [copyStatus, flashCopy] = useFlashStatus();
  const [saveStatus, flashSave] = useFlashStatus();

  const handleClose = () => wizard.finishAndClose(onClose);

  const handleByteCaptureNext = () => {
    wizardRef.current?.finish();
    wizard.goNext();
  };

  // Cancel appears on every step. The dialog cannot be dismissed any other way,
  // and the run holds the controllers released, so a step that misbehaves must
  // never be a dead end. Cancel always restores the hold on its way out.
  const cancel = <Button variant="danger" onClick={handleClose}>Cancel</Button>;

  const actions = wizard.step === 'summary' ? (
    <>
      <Button variant="secondary" onClick={wizard.restart}>Restart on another controller</Button>
      <Button variant={saveStatus === 'error' ? 'danger' : 'tertiary'} onClick={() => handleSaveToDisk().then(flashSave)}>
        {saveStatus === 'ok' ? 'Saved' : saveStatus === 'error' ? 'Failed' : 'Write to disk'}
      </Button>
      <Button variant={copyStatus === 'error' ? 'danger' : 'tertiary'} onClick={() => handleCopyJson().then(flashCopy)}>
        {copyStatus === 'ok' ? 'Copied' : copyStatus === 'error' ? 'Failed' : 'Copy JSON'}
      </Button>
      <Button variant="primary" onClick={handleClose}>Close</Button>
    </>
  ) : (
    <DiagnosticsStepActions
      wizard={wizard}
      cancelAction={cancel}
      onByteCaptureNext={handleByteCaptureNext}
      capturedCount={capturedCount}
    />
  );

  return (
    <DialogShell
      open={open}
      onClose={handleClose}
      dismissable={false}
      title="Gamepad diagnostics"
      headerExtra={<StepIndicator labels={wizard.stepLabels} current={wizard.stepIndex} />}
      className="diagnostics-wizard"
      actions={actions}
    >
      <DiagnosticsFlowBody wizard={wizard} wizardRef={wizardRef} onCapturedCountChange={setCapturedCount} />
    </DialogShell>
  );
};

export { DiagnosticsWizardDialog };
