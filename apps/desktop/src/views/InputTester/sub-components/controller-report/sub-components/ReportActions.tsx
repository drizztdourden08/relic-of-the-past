/* @layer renderer-components @kind component */
import { Button } from '@drizztdourden08/tessera/primitives';
import type { ReportDialogPartProps } from '../report-dialog-controls.type';
import { DiagnosticsReportActions } from './DiagnosticsReportActions';

const ReportActions = (props: ReportDialogPartProps) => {
  const { form, controls } = props;
  const { closeForm, filed, goAbout, goUserInfo, goDiagnostics, openSanctuary, openIssue } = controls;

  if (filed) {
    return (
      <>
        <Button variant="secondary" onClick={closeForm}>Close</Button>
        <Button variant="secondary" onClick={openSanctuary}>See it in the Sanctuary</Button>
        <Button variant="primary" onClick={openIssue}>Open on GitHub</Button>
      </>
    );
  }

  if (form.step === 'about') {
    return (
      <>
        <Button variant="danger" onClick={closeForm}>Cancel</Button>
        <Button variant="primary" onClick={goUserInfo}>Next</Button>
      </>
    );
  }

  if (form.step === 'user-info') {
    return (
      <>
        <Button variant="secondary" onClick={goAbout}>Back</Button>
        <Button variant="primary" onClick={goDiagnostics} disabled={!form.canLeaveUserInfo}>Next</Button>
      </>
    );
  }

  if (form.step === 'diagnostics') return <DiagnosticsReportActions form={form} controls={controls} />;

  return (
    <>
      <Button variant="secondary" onClick={form.backToDiagnostics}>Back</Button>
      <Button variant="primary" onClick={form.submit} disabled={!form.canSubmit}>
        {form.status === 'submitting' ? 'Submitting...' : 'Send report'}
      </Button>
    </>
  );
};

export { ReportActions };
