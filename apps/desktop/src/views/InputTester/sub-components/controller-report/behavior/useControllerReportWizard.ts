/* @layer renderer-components @kind hook */
import { useCallback, useMemo } from 'react';
import type { WizardApi, WizardStepDef } from '@drizztdourden08/tessera/composites';
import { visibleSteps } from '../../diagnostics-wizard/behavior/wizard-steps';
import type { DiagnosticsWizardState } from '../../diagnostics-wizard/diagnostics-wizard.type';
import type { ReportDialogPartProps } from '../report-dialog-controls.type';
import type { WizardValues } from '../ControllerReportDialog.type';

const buildSteps = (hasByteCapability: boolean): readonly WizardStepDef<WizardValues>[] => [
  { id: 'about', label: 'About', buttons: { next: { label: 'Next' } } },
  { id: 'user-info', label: 'Your info', buttons: { next: { label: 'Next' } } },
  ...visibleSteps(hasByteCapability).map(({ step, label }) => ({
    id: step,
    label,
    buttons: { next: { label: step === 'summary' ? 'Use this capture' : 'Next' } },
  })),
  { id: 'review', label: 'Review', buttons: { next: { label: 'Send report', icon: null } } },
];

const currentStepId = ({ form }: ReportDialogPartProps) => {
  if (form.step === 'diagnostics') return form.wizard.step;
  if (form.step === 'confirm') return 'review';
  return form.step;
};

const captureInvalidMessage = (wizard: DiagnosticsWizardState, capturedCount: number): string | null => {
  if (wizard.step === 'intro') return wizard.releaseStatus !== 'done' ? 'Wait for controller input to resume.' : null;
  if (wizard.step === 'choose-controller') {
    return wizard.deviceKey === null || ['starting', 'fetching', 'stopping'].includes(wizard.layoutStage)
      ? 'Choose a controller and wait for its layout capture.' : null;
  }
  if (wizard.step === 'byte-capture') return capturedCount === 0 ? 'Record at least one input before continuing.' : null;
  return null;
};

const completionInvalidMessage = (wizard: DiagnosticsWizardState): string | null => {
  if (wizard.step === 'positional-capture') return wizard.restoreStatus !== 'done' ? 'Wait for controller input to resume.' : null;
  if (wizard.step === 'summary') return !wizard.byteCapture ? 'Complete the byte capture before continuing.' : null;
  return null;
};

const invalidMessage = ({ form, controls }: ReportDialogPartProps): string | null => {
  if (form.step === 'user-info') return !form.canLeaveUserInfo ? 'Sign in or enter a valid email address before continuing.' : null;
  if (form.step === 'diagnostics') return captureInvalidMessage(form.wizard, controls.capturedCount) ?? completionInvalidMessage(form.wizard);
  if (form.step === 'confirm') return !form.canSubmit && form.status !== 'submitting' ? 'Complete the required report details before sending.' : null;
  return null;
};

const useControllerReportWizard = (props: ReportDialogPartProps): WizardApi<WizardValues> | null => {
  const { form, controls } = props;
  const steps = useMemo(() => buildSteps(form.wizard.hasByteCapability), [form.wizard.hasByteCapability]);
  const index = steps.findIndex((step) => step.id === currentStepId(props));
  const current = steps[index] ?? steps[0];
  const invalid = invalidMessage(props);
  const values = useMemo<WizardValues>(() => ({}), []);
  const busy = form.status === 'submitting' || (
    form.step === 'diagnostics' && form.wizard.step === 'positional-capture' && form.wizard.restoreStatus !== 'done'
  );

  const goNext = useCallback(() => {
    if (form.step === 'about') controls.goUserInfo();
    else if (form.step === 'user-info') controls.goDiagnostics();
    else if (form.step === 'diagnostics') {
      if (form.wizard.step === 'summary') form.finishDiagnostics();
      else if (form.wizard.step === 'choose-controller') void form.wizard.confirmChoice();
      else if (form.wizard.step === 'byte-capture') controls.handleByteCaptureNext();
      else form.wizard.goNext();
    }
  }, [form, controls]);

  const goBack = useCallback(() => {
    if (form.step === 'user-info') controls.goAbout();
    else if (form.step === 'diagnostics' && form.wizard.step === 'intro') controls.goUserInfo();
    else if (form.step === 'diagnostics') form.wizard.goBack();
    else if (form.step === 'confirm') form.backToDiagnostics();
  }, [form, controls]);

  return useMemo(() => {
    if (current === undefined) return null;
    return {
      steps,
      current,
      index,
      isFirst: current.id === 'about',
      isLast: current.id === 'review',
      invalid,
      hint: null,
      canGoTo: () => false,
      values,
      visited: steps.slice(0, index).map((step) => step.id),
      errors: {},
      dirty: false,
      busy,
      setValue: () => undefined,
      update: () => undefined,
      setError: () => undefined,
      goNext,
      goBack,
      goTo: () => undefined,
      finish: form.submit,
      reset: form.reset,
    };
  }, [steps, current, index, invalid, values, busy, goNext, goBack, form.submit, form.reset]);
};

export { useControllerReportWizard };
