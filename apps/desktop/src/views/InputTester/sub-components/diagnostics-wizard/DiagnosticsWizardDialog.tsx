/* @layer renderer-components @kind component */
import { useCallback, useMemo, useRef, useState } from 'react';
import { WizardDialog } from '@drizztdourden08/tessera/composites';
import type { WizardApi, WizardStepDef } from '@drizztdourden08/tessera/composites';
import { Button } from '@drizztdourden08/tessera/primitives';
import type { HidWizardHandle } from '../HidCalibrationWizard';
import { useDiagnosticsWizardState } from './behavior/useDiagnosticsWizardState';
import { visibleSteps } from './behavior/wizard-steps';
import { useSummaryExport } from './behavior/useSummaryExport';
import { useFlashStatus } from '../hid-calibration/hooks/useFlashStatus';
import { COPY_LABELS, SAVE_LABELS } from './diagnostics-wizard.constants';
import { DiagnosticsFlowBody } from './DiagnosticsFlowBody';
import type { DiagnosticsWizardDialogProps } from './DiagnosticsWizardDialog.type';
import './DiagnosticsWizardDialog.css';

type WizardValues = Record<string, never>;

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

  const steps = useMemo<readonly WizardStepDef<WizardValues>[]>(() => visibleSteps(wizard.hasByteCapability).map(({ step, label }, stepIndex) => ({
    id: step,
    label,
    buttons: {
      cancel: stepIndex === wizard.stepLabels.length - 1 ? false : undefined,
      next: { label: stepIndex === wizard.stepLabels.length - 1 ? 'Close' : 'Next' },
    },
  })), [wizard.hasByteCapability, wizard.stepLabels.length]);
  const index = wizard.stepIndex;
  const values = useMemo<WizardValues>(() => ({}), []);
  const current = steps[index] ?? steps[0];
  const invalid = wizard.step === 'intro' && wizard.releaseStatus !== 'done'
    ? 'Wait for controller input to resume.'
    : wizard.step === 'choose-controller' && (
      wizard.deviceKey === null || ['starting', 'fetching', 'stopping'].includes(wizard.layoutStage)
    )
      ? 'Choose a controller and wait for its layout capture.'
      : wizard.step === 'byte-capture' && capturedCount === 0
        ? 'Record at least one input before continuing.'
        : wizard.step === 'positional-capture' && wizard.restoreStatus !== 'done'
          ? 'Wait for controller input to resume.'
          : null;

  const tesseraWizard = useMemo<WizardApi<WizardValues>>(() => ({
    steps,
    current: current!,
    index,
    isFirst: index === 0,
    isLast: wizard.step === 'summary',
    invalid,
    hint: null,
    canGoTo: () => false,
    values,
    visited: steps.slice(0, index).map((step) => step.id),
    errors: {},
    dirty: false,
    busy: wizard.step === 'positional-capture' && wizard.restoreStatus !== 'done',
    setValue: () => undefined,
    update: () => undefined,
    setError: () => undefined,
    goNext: () => {
      if (wizard.step === 'choose-controller') void wizard.confirmChoice();
      else if (wizard.step === 'byte-capture') handleByteCaptureNext();
      else if (wizard.step !== 'summary') wizard.goNext();
    },
    goBack: wizard.goBack,
    goTo: () => undefined,
    finish: async () => handleClose(),
    reset: wizard.restart,
  }), [steps, current, index, invalid, values, wizard, handleByteCaptureNext, handleClose]);

  const summaryActions = (
    <div className="diagnostics-wizard__summary-actions">
      <Button variant="secondary" onClick={wizard.restart}>Restart on another controller</Button>
      <Button variant="tertiary" onClick={() => { void handleSave(); }}>{SAVE_LABELS[saveStatus]}</Button>
      <Button variant="tertiary" onClick={() => { void handleCopy(); }}>{COPY_LABELS[copyStatus]}</Button>
    </div>
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
