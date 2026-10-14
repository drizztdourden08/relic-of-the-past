/* @layer renderer-components @kind component */
import { Button } from '@drizztdourden08/tessera/primitives';
import { COPY_LABELS } from '../../diagnostics-wizard/diagnostics-wizard.constants';
import { DiagnosticsStepActions } from '../../diagnostics-wizard/sub-components/DiagnosticsStepActions';
import { FlashButton } from '../../diagnostics-wizard/sub-components/FlashButton';
import type { ReportDialogPartProps } from '../report-dialog-controls.type';

const DiagnosticsReportActions = (props: ReportDialogPartProps) => {
  const { form, controls } = props;
  const { wizard } = form;
  const { closeForm, copyStatus, handleCopy, goUserInfo, handleByteCaptureNext, capturedCount } = controls;
  const cancel = <Button variant="danger" onClick={closeForm}>Cancel</Button>;

  if (wizard.step !== 'summary') {
    return (
      <DiagnosticsStepActions
        wizard={wizard}
        cancelAction={cancel}
        introBack={goUserInfo}
        onByteCaptureNext={handleByteCaptureNext}
        capturedCount={capturedCount}
      />
    );
  }

  return (
    <>
      {cancel}
      <Button variant="secondary" onClick={wizard.goBack} disabled={wizard.restoreStatus !== 'done'}>Back</Button>
      <FlashButton status={copyStatus} onClick={handleCopy} labels={COPY_LABELS} />
      <Button variant="primary" onClick={form.finishDiagnostics} disabled={!wizard.byteCapture}>
        Use this capture
      </Button>
    </>
  );
};

export { DiagnosticsReportActions };
