/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { WizardDialog, DialogShell } from '@drizztdourden08/tessera/composites';
import type { WizardApi, WizardStepDef } from '@drizztdourden08/tessera/composites';
import { Box } from '@drizztdourden08/tessera/primitives';
import { useControllerReportForm } from './behavior/useControllerReportForm';
import { useReportDialogControls } from './behavior/useReportDialogControls';
import { visibleSteps } from '../diagnostics-wizard/behavior/wizard-steps';
import { COPY_LABELS } from '../diagnostics-wizard/diagnostics-wizard.constants';
import { FlashButton } from '../diagnostics-wizard/sub-components/FlashButton';
import { ReportActions } from './sub-components/ReportActions';
import { ReportBody } from './sub-components/ReportBody';
import type { ControllerReportDialogProps } from './ControllerReportDialog.type';
import './ControllerReportDialog.css';

type WizardValues = Record<string, never>;

const ControllerReportDialog = (props: ControllerReportDialogProps) => {
  const { open, onClose, deviceKey } = props;
  const form = useControllerReportForm(deviceKey);
  const controls = useReportDialogControls({ form, onClose });
  const showResult = open && controls.filed !== null;
  const values = useMemo<WizardValues>(() => ({}), []);
  const steps = useMemo<readonly WizardStepDef<WizardValues>[]>(() => [
    { id: 'about', label: 'About', buttons: { next: { label: 'Next' } } },
    { id: 'user-info', label: 'Your info', buttons: { next: { label: 'Next' } } },
    ...visibleSteps(form.wizard.hasByteCapability).map(({ step, label }) => ({
      id: step,
      label,
      buttons: { next: { label: step === 'summary' ? 'Use this capture' : 'Next' } },
    })),
    { id: 'review', label: 'Review', buttons: { next: { label: 'Send report', icon: null } } },
  ], [form.wizard.hasByteCapability]);
  const currentId = form.step === 'diagnostics' ? form.wizard.step : form.step === 'confirm' ? 'review' : form.step;
  const index = steps.findIndex((step) => step.id === currentId);
  const current = steps[index] ?? steps[0]!;
  const invalid = form.step === 'user-info' && !form.canLeaveUserInfo
    ? 'Sign in or enter a valid email address before continuing.'
    : form.step === 'diagnostics' && form.wizard.step === 'intro' && form.wizard.releaseStatus !== 'done'
      ? 'Wait for controller input to resume.'
      : form.step === 'diagnostics' && form.wizard.step === 'choose-controller' && (
        form.wizard.deviceKey === null || ['starting', 'fetching', 'stopping'].includes(form.wizard.layoutStage)
      )
        ? 'Choose a controller and wait for its layout capture.'
        : form.step === 'diagnostics' && form.wizard.step === 'byte-capture' && controls.capturedCount === 0
          ? 'Record at least one input before continuing.'
          : form.step === 'diagnostics' && form.wizard.step === 'positional-capture' && form.wizard.restoreStatus !== 'done'
            ? 'Wait for controller input to resume.'
            : form.step === 'diagnostics' && form.wizard.step === 'summary' && !form.wizard.byteCapture
              ? 'Complete the byte capture before continuing.'
              : form.step === 'confirm' && !form.canSubmit && form.status !== 'submitting'
                ? 'Complete the required report details before sending.'
                : null;

  const tesseraWizard = useMemo<WizardApi<WizardValues>>(() => ({
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
    busy: form.status === 'submitting' || (form.step === 'diagnostics' && form.wizard.step === 'positional-capture' && form.wizard.restoreStatus !== 'done'),
    setValue: () => undefined,
    update: () => undefined,
    setError: () => undefined,
    goNext: () => {
      if (form.step === 'about') controls.goUserInfo();
      else if (form.step === 'user-info') controls.goDiagnostics();
      else if (form.step === 'diagnostics' && form.wizard.step === 'summary') form.finishDiagnostics();
      else if (form.step === 'diagnostics' && form.wizard.step === 'choose-controller') void form.wizard.confirmChoice();
      else if (form.step === 'diagnostics' && form.wizard.step === 'byte-capture') controls.handleByteCaptureNext();
      else if (form.step === 'diagnostics') form.wizard.goNext();
    },
    goBack: () => {
      if (form.step === 'user-info') controls.goAbout();
      else if (form.step === 'diagnostics' && form.wizard.step === 'intro') controls.goUserInfo();
      else if (form.step === 'diagnostics') form.wizard.goBack();
      else if (form.step === 'confirm') form.backToDiagnostics();
    },
    goTo: () => undefined,
    finish: form.submit,
    reset: form.reset,
  }), [steps, current, index, invalid, values, form, controls]);
  const summaryActions = (
    <div className="diagnostics-wizard__summary-actions">
      <FlashButton status={controls.copyStatus} onClick={controls.handleCopy} labels={COPY_LABELS} />
    </div>
  );

  if (showResult) {
    return (
      <DialogShell
        open
        onClose={controls.closeForm}
        title="Report filed"
        className="controller-report controller-report--wide"
        actions={<ReportActions form={form} controls={controls} />}
      >
        <Box className="controller-report__body"><ReportBody form={form} controls={controls} /></Box>
      </DialogShell>
    );
  }

  return (
    <WizardDialog
      wizard={tesseraWizard}
      open={open}
      title="Report a controller as not working"
      onExit={controls.closeForm}
      className="controller-report__wizard"
    >
      <ReportBody form={form} controls={controls} summaryActions={summaryActions} />
    </WizardDialog>
  );
};

export { ControllerReportDialog };
