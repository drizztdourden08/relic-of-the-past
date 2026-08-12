/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { DialogShell } from '@ds/composites/DialogShell';
import { Button, Box, Text } from '@ds/primitives';
import type { HidWizardHandle } from '../HidCalibrationWizard';
import { DiagnosticsFlowBody } from '../diagnostics-wizard/DiagnosticsFlowBody';
import { DiagnosticsStepActions } from '../diagnostics-wizard/sub-components/DiagnosticsStepActions';
import { useSummaryExport } from '../diagnostics-wizard/behavior/useSummaryExport';
import { useFlashStatus } from '../hid-calibration/hooks/useFlashStatus';
import { useControllerReportForm } from './behavior/useControllerReportForm';
import { buildReportStepLabels, reportStepIndex } from './report-step-labels';
import { IntroStep } from './sub-components/IntroStep';
import { UserInfoStep } from './sub-components/UserInfoStep';
import { ConfirmStep } from './sub-components/ConfirmStep';
import { StepIndicator } from './sub-components/StepIndicator';
import type { ControllerReportDialogProps } from './ControllerReportDialog.type';
import './ControllerReportDialog.css';
import '../diagnostics-wizard/DiagnosticsWizardDialog.css';

/**
 * One persistent dialog for the whole flow — step content swaps inside a
 * fixed header (title + step strip) / footer (actions) shell, so neither
 * re-mounts between steps. The diagnostic portion (intro through summary)
 * is the same DiagnosticsFlowBody + DiagnosticsStepActions the standalone
 * Gamepad Diagnostics dialog renders, driven by the same
 * useDiagnosticsWizardState machine, so this report can never drift from
 * what that dialog actually does.
 */
const ControllerReportDialog = (props: ControllerReportDialogProps) => {
  const { open, onClose, deviceKey } = props;
  const form = useControllerReportForm(deviceKey);
  const wizardRef = useRef<HidWizardHandle>(null);
  const [capturedCount, setCapturedCount] = useState(0);
  const { handleCopyJson } = useSummaryExport(form.wizard.byteCapture, form.wizard.positionalRecords);
  const [copyStatus, flashCopy] = useFlashStatus();
  const showResult = open && form.status === 'done' && form.resultUrl !== null;

  const closeForm = () => {
    onClose();
    form.reset();
  };

  const openOnGithub = () => {
    if (form.resultUrl) window.open(form.resultUrl, '_blank');
    closeForm();
  };

  const handleByteCaptureNext = () => {
    wizardRef.current?.finish();
    form.wizard.goNext();
  };

  const cancel = <Button variant="danger" onClick={closeForm}>Cancel</Button>;

  const diagnosticsActions = form.wizard.step === 'summary' ? (
    <>
      {cancel}
      <Button variant="secondary" onClick={form.wizard.goBack} disabled={form.wizard.restoreStatus !== 'done'}>Back</Button>
      <Button variant={copyStatus === 'error' ? 'danger' : 'tertiary'} onClick={() => handleCopyJson().then(flashCopy)}>
        {copyStatus === 'ok' ? 'Copied' : copyStatus === 'error' ? 'Failed' : 'Copy JSON'}
      </Button>
      <Button variant="primary" onClick={form.finishDiagnostics} disabled={!form.wizard.byteCapture}>
        Use this capture
      </Button>
    </>
  ) : (
    <DiagnosticsStepActions
      wizard={form.wizard}
      cancelAction={cancel}
      introBack={() => form.goToStep('user-info')}
      onByteCaptureNext={handleByteCaptureNext}
      capturedCount={capturedCount}
    />
  );

  const actions = showResult ? (
    <>
      <Button variant="secondary" onClick={closeForm}>Close</Button>
      <Button variant="primary" onClick={openOnGithub}>Open on GitHub</Button>
    </>
  ) : form.step === 'about' ? (
    <>
      {cancel}
      <Button variant="primary" onClick={() => form.goToStep('user-info')}>Next</Button>
    </>
  ) : form.step === 'user-info' ? (
    <>
      <Button variant="secondary" onClick={() => form.goToStep('about')}>Back</Button>
      <Button variant="primary" onClick={() => form.goToStep('diagnostics')} disabled={!form.canLeaveUserInfo}>Next</Button>
    </>
  ) : form.step === 'diagnostics' ? diagnosticsActions : (
    <>
      <Button variant="secondary" onClick={form.backToDiagnostics}>Back</Button>
      <Button variant="primary" onClick={form.submit} disabled={!form.canSubmit}>
        {form.status === 'submitting' ? 'Submitting…' : 'Send report'}
      </Button>
    </>
  );

  return (
    <DialogShell
      open={open}
      onClose={closeForm}
      title={showResult ? 'Report filed' : 'Report a controller as not working'}
      headerExtra={!showResult && <StepIndicator labels={buildReportStepLabels(form.wizard)} current={reportStepIndex(form.step, form.wizard)} />}
      className="controller-report controller-report--wide"
      actions={actions}
    >
      <Box className="controller-report__body">
        {showResult ? (
          <>
            <Text as="p">Thanks — your report was filed.</Text>
            <Text as="p" className="controller-report__result-url">{form.resultUrl}</Text>
          </>
        ) : form.step === 'about' ? (
          <IntroStep />
        ) : form.step === 'user-info' ? (
          <UserInfoStep
            email={form.email} setEmail={form.setEmail} emailTouched={form.emailTouched} emailValid={form.emailValid}
            name={form.name} setName={form.setName} additionalInfo={form.additionalInfo} setAdditionalInfo={form.setAdditionalInfo}
            debugText={form.debugText}
          />
        ) : form.step === 'diagnostics' ? (
          <DiagnosticsFlowBody wizard={form.wizard} wizardRef={wizardRef} onCapturedCountChange={setCapturedCount} />
        ) : (
          <ConfirmStep
            email={form.email} name={form.name} additionalInfo={form.additionalInfo} debugText={form.debugText}
            detection={form.detection} calibrationMap={form.calibrationMap} diagnosticsReport={form.diagnosticsReport} status={form.status}
          />
        )}
      </Box>
    </DialogShell>
  );
};

export { ControllerReportDialog };
