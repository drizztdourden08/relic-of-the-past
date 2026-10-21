/* @layer renderer-components @kind hook */
import { useCallback, useMemo } from 'react';
import type { WizardApi, WizardStepDef } from '@drizztdourden08/tessera/composites';
import { visibleSteps } from './wizard-steps';
import type { DiagnosticsWizardState } from '../diagnostics-wizard.type';
import type { WizardValues } from '../DiagnosticsWizardDialog.type';

const buildSteps = (hasByteCapability: boolean, stepCount: number): readonly WizardStepDef<WizardValues>[] =>
  visibleSteps(hasByteCapability).map(({ step, label }, stepIndex) => ({
    id: step,
    label,
    buttons: {
      cancel: stepIndex === stepCount - 1 ? false : undefined,
      next: { label: stepIndex === stepCount - 1 ? 'Close' : 'Next' },
    },
  }));

const invalidMessage = (wizard: DiagnosticsWizardState, capturedCount: number): string | null => {
  if (wizard.step === 'intro' && wizard.releaseStatus !== 'done') return 'Wait for controller input to resume.';
  if (wizard.step === 'choose-controller' && (
    wizard.deviceKey === null || ['starting', 'fetching', 'stopping'].includes(wizard.layoutStage)
  )) return 'Choose a controller and wait for its layout capture.';
  if (wizard.step === 'byte-capture' && capturedCount === 0) return 'Record at least one input before continuing.';
  if (wizard.step === 'positional-capture' && wizard.restoreStatus !== 'done') return 'Wait for controller input to resume.';
  return null;
};

const useDiagnosticsTesseraWizard = (
  wizard: DiagnosticsWizardState,
  capturedCount: number,
  handleByteCaptureNext: () => void,
  handleClose: () => void,
): WizardApi<WizardValues> | null => {
  const steps = useMemo(
    () => buildSteps(wizard.hasByteCapability, wizard.stepLabels.length),
    [wizard.hasByteCapability, wizard.stepLabels.length],
  );
  const index = wizard.stepIndex;
  const current = steps[index] ?? steps[0];
  const values = useMemo<WizardValues>(() => ({}), []);
  const invalid = invalidMessage(wizard, capturedCount);

  const goNext = useCallback(() => {
    if (wizard.step === 'choose-controller') void wizard.confirmChoice();
    else if (wizard.step === 'byte-capture') handleByteCaptureNext();
    else if (wizard.step !== 'summary') wizard.goNext();
  }, [wizard, handleByteCaptureNext]);

  return useMemo(() => {
    if (current === undefined) return null;
    return {
      steps,
      current,
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
      goNext,
      goBack: wizard.goBack,
      goTo: () => undefined,
      finish: () => Promise.resolve(handleClose()),
      reset: wizard.restart,
    };
  }, [steps, current, index, wizard, invalid, values, goNext, handleClose]);
};

export { useDiagnosticsTesseraWizard };
