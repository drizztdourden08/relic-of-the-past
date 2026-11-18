/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Button } from '@drizztdourden08/tessera/primitives';
import { COPY_LABELS } from '@drizztdourden08/brock-input/renderer';
import { DiagnosticsStepActions } from '@drizztdourden08/brock-input/renderer';
import { FlashButton } from '@drizztdourden08/brock-input/renderer';
import type { ReportDialogPartProps } from '../report-dialog-controls.type';

const DiagnosticsReportActions = (props: ReportDialogPartProps) => {
  const t = useT();
  const { form, controls } = props;
  const { wizard } = form;
  const { closeForm, copyStatus, handleCopy, goUserInfo, handleByteCaptureNext, capturedCount } = controls;
  const cancel = <Button variant="danger" onClick={closeForm}>{t('views-input-tester:actions.cancel')}</Button>;

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
      <Button variant="secondary" onClick={wizard.goBack} disabled={wizard.restoreStatus !== 'done'}>{t('views-input-tester:actions.back')}</Button>
      <FlashButton status={copyStatus} onClick={handleCopy} labels={COPY_LABELS} />
      <Button variant="primary" onClick={form.finishDiagnostics} disabled={!wizard.byteCapture}>
        {t('views-input-tester:actions.useCapture')}
      </Button>
    </>
  );
};

export { DiagnosticsReportActions };
