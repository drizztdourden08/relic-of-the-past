/* @layer renderer-components @kind component */
import { useCallback, useRef, useState } from 'react';
import { DialogShell } from '@drizztdourden08/tessera/composites';
import { Button } from '@drizztdourden08/tessera/primitives';
import type { HidWizardHandle } from '../HidCalibrationWizard';
import { StepIndicator } from '../controller-report/sub-components/StepIndicator';
import { useDiagnosticsWizardState } from './behavior/useDiagnosticsWizardState';
import { useSummaryExport } from './behavior/useSummaryExport';
import { useFlashStatus } from '../hid-calibration/hooks/useFlashStatus';
import { COPY_LABELS, SAVE_LABELS } from './diagnostics-wizard.constants';
import { DiagnosticsFlowBody } from './DiagnosticsFlowBody';
import { DiagnosticsStepActions } from './sub-components/DiagnosticsStepActions';
import { FlashButton } from './sub-components/FlashButton';
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
  const { finishAndClose, goNext } = wizard;

  const handleClose = useCallback(() => finishAndClose(onClose), [finishAndClose, onClose]);

  const handleByteCaptureNext = useCallback(() => {
    wizardRef.current?.finish();
    goNext();
  }, [goNext]);

  const handleSave = useCallback(() => handleSaveToDisk().then(flashSave), [handleSaveToDisk, flashSave]);
  const handleCopy = useCallback(() => handleCopyJson().then(flashCopy), [handleCopyJson, flashCopy]);

  const cancel = <Button variant="danger" onClick={handleClose}>Cancel</Button>;

  const actions = wizard.step === 'summary' ? (
    <>
      <Button variant="secondary" onClick={wizard.restart}>Restart on another controller</Button>
      <FlashButton status={saveStatus} onClick={handleSave} labels={SAVE_LABELS} />
      <FlashButton status={copyStatus} onClick={handleCopy} labels={COPY_LABELS} />
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
      titleWrap
      headerExtra={<StepIndicator labels={wizard.stepLabels} current={wizard.stepIndex} />}
      className="diagnostics-wizard"
      actions={actions}
    >
      <DiagnosticsFlowBody wizard={wizard} wizardRef={wizardRef} onCapturedCountChange={setCapturedCount} />
    </DialogShell>
  );
};

export { DiagnosticsWizardDialog };
