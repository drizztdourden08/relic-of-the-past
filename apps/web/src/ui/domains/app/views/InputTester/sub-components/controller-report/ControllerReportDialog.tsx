/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { DialogShell } from '@ds/composites/DialogShell';
import { Button, Box, Text } from '@ds/primitives';
import { HidCalibrationWizard } from '../HidCalibrationWizard';
import type { HidWizardHandle } from '../HidCalibrationWizard';
import { useControllerReportForm } from './behavior/useControllerReportForm';
import { IntroStep } from './sub-components/IntroStep';
import { UserInfoStep } from './sub-components/UserInfoStep';
import { ConfirmStep } from './sub-components/ConfirmStep';
import { StepIndicator } from './sub-components/StepIndicator';
import type { ControllerReportDialogProps } from './ControllerReportDialog.type';
import './ControllerReportDialog.css';

const STEP_ORDER = ['intro', 'user-info', 'byte-capture', 'confirm'] as const;
const STEP_LABELS = ['About', 'Your info', 'Detection', 'Review'] as const;

/** One persistent dialog for the whole flow — step content swaps inside a fixed
 *  header (title + step strip) / footer (actions) shell, so neither re-mounts
 *  between steps. Step 3 reuses HidCalibrationWizard verbatim, with its own
 *  header actions suppressed — Copy/Finish move into this dialog's footer. */
const ControllerReportDialog = (props: ControllerReportDialogProps) => {
  const { open, onClose, deviceKey } = props;
  const form = useControllerReportForm(deviceKey);
  const wizardRef = useRef<HidWizardHandle>(null);
  const [capturedCount, setCapturedCount] = useState(0);
  const showResult = open && form.status === 'done' && form.resultUrl !== null;

  const closeForm = () => {
    onClose();
    form.reset();
  };

  const openOnGithub = () => {
    if (form.resultUrl) window.open(form.resultUrl, '_blank');
    closeForm();
  };

  const stepIndex = STEP_ORDER.indexOf(form.step);

  const actions = showResult ? (
    <>
      <Button variant="secondary" onClick={closeForm}>Close</Button>
      <Button variant="primary" onClick={openOnGithub}>Open on GitHub</Button>
    </>
  ) : form.step === 'intro' ? (
    <>
      <Button variant="secondary" onClick={closeForm}>Cancel</Button>
      <Button variant="primary" onClick={() => form.goToStep('user-info')}>Next</Button>
    </>
  ) : form.step === 'user-info' ? (
    <>
      <Button variant="secondary" onClick={() => form.goToStep('intro')}>Back</Button>
      <Button variant="primary" onClick={form.goToByteCapture} disabled={!form.canLeaveUserInfo}>Next</Button>
    </>
  ) : form.step === 'byte-capture' ? (
    <>
      <Button variant="secondary" onClick={() => form.goToStep('user-info')}>Back</Button>
      <Button variant="tertiary" onClick={() => wizardRef.current?.copyJson()}>Copy JSON</Button>
      <Button variant="primary" onClick={() => wizardRef.current?.finish()} disabled={capturedCount === 0}>
        Use this capture
      </Button>
    </>
  ) : (
    <>
      <Button variant="secondary" onClick={() => form.goToStep('byte-capture')}>Back</Button>
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
      headerExtra={!showResult && <StepIndicator labels={STEP_LABELS} current={stepIndex} />}
      className="controller-report controller-report--wide"
      actions={actions}
    >
      <Box className="controller-report__body">
        {showResult ? (
          <>
            <Text as="p">Thanks — your report was filed.</Text>
            <Text as="p" className="controller-report__result-url">{form.resultUrl}</Text>
          </>
        ) : form.step === 'intro' ? (
          <IntroStep />
        ) : form.step === 'user-info' ? (
          <UserInfoStep
            email={form.email} setEmail={form.setEmail} emailTouched={form.emailTouched} emailValid={form.emailValid}
            name={form.name} setName={form.setName} additionalInfo={form.additionalInfo} setAdditionalInfo={form.setAdditionalInfo}
            debugText={form.debugText}
          />
        ) : form.step === 'byte-capture' ? (
          <HidCalibrationWizard
            ref={wizardRef}
            deviceKey={deviceKey}
            hideOwnActions
            onCapturedCountChange={setCapturedCount}
            onComplete={form.handleByteCaptureComplete}
            onCancel={() => form.goToStep('user-info')}
          />
        ) : (
          <ConfirmStep
            email={form.email} name={form.name} additionalInfo={form.additionalInfo} debugText={form.debugText}
            detection={form.detection} calibrationMap={form.calibrationMap} status={form.status}
          />
        )}
      </Box>
    </DialogShell>
  );
};

export { ControllerReportDialog };
