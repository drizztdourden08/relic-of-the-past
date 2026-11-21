/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Button } from '@drizztdourden08/tessera/primitives';
import type { ReportDialogPartProps } from '../report-dialog-controls.type';
import { DiagnosticsReportActions } from './DiagnosticsReportActions';

const ReportActions = (props: ReportDialogPartProps) => {
  const t = useT();
  const { form, controls } = props;
  const { closeForm, filed, goAbout, goUserInfo, goDiagnostics, openSanctuary, openIssue } = controls;

  if (filed) {
    return (
      <>
        <Button variant="secondary" onClick={closeForm}>{t('views-input-tester:actions.close')}</Button>
        <Button variant="secondary" onClick={openSanctuary}>{t('views-input-tester:actions.sanctuary')}</Button>
        <Button variant="primary" onClick={openIssue}>{t('views-input-tester:actions.github')}</Button>
      </>
    );
  }

  if (form.step === 'about') {
    return (
      <>
        <Button variant="danger" onClick={closeForm}>{t('views-input-tester:actions.cancel')}</Button>
        <Button variant="primary" onClick={goUserInfo}>{t('views-input-tester:actions.next')}</Button>
      </>
    );
  }

  if (form.step === 'user-info') {
    return (
      <>
        <Button variant="secondary" onClick={goAbout}>{t('views-input-tester:actions.back')}</Button>
        <Button variant="primary" onClick={goDiagnostics} disabled={!form.canLeaveUserInfo}>{t('views-input-tester:actions.next')}</Button>
      </>
    );
  }

  if (form.step === 'diagnostics') return <DiagnosticsReportActions form={form} controls={controls} />;

  return (
    <>
      <Button variant="secondary" onClick={form.backToDiagnostics}>{t('views-input-tester:actions.back')}</Button>
      <Button variant="primary" onClick={form.submit} disabled={!form.canSubmit}>
        {form.status === 'submitting' ? t('views-input-tester:actions.submitting') : t('views-input-tester:actions.send')}
      </Button>
    </>
  );
};

export { ReportActions };
