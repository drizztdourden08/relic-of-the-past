/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { DiagnosticsFlowBody } from '../../diagnostics-wizard/DiagnosticsFlowBody';
import type { ReportDialogPartProps } from '../report-dialog-controls.type';
import { ConfirmStep } from './ConfirmStep';
import { IntroStep } from './IntroStep';
import { UserInfoStep } from './UserInfoStep';

const ReportBody = (props: ReportDialogPartProps) => {
  const { form, controls } = props;
  const { filed, wizardRef, setCapturedCount } = controls;

  if (filed) {
    return (
      <>
        <Text as="p">Thanks, your report was filed.</Text>
        <Text as="p" className="controller-report__result-url">{filed.issueUrl}</Text>
      </>
    );
  }

  if (form.step === 'about') return <IntroStep />;

  if (form.step === 'user-info') {
    return (
      <UserInfoStep
        me={form.me} email={form.email} setEmail={form.setEmail} emailTouched={form.emailTouched} emailValid={form.emailValid}
        name={form.name} setName={form.setName} additionalInfo={form.additionalInfo} setAdditionalInfo={form.setAdditionalInfo}
        debugText={form.debugText}
      />
    );
  }

  if (form.step === 'diagnostics') {
    return <DiagnosticsFlowBody wizard={form.wizard} wizardRef={wizardRef} onCapturedCountChange={setCapturedCount} />;
  }

  return (
    <ConfirmStep
      me={form.me} email={form.email} name={form.name} additionalInfo={form.additionalInfo} debugText={form.debugText}
      detection={form.detection} calibrationMap={form.calibrationMap} diagnosticsReport={form.diagnosticsReport} status={form.status}
    />
  );
};

export { ReportBody };
