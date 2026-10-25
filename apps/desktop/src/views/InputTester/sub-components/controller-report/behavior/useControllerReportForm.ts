/* @layer renderer-components @kind hook */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { useCallback, useEffect, useState } from 'react';
import { useDebugTextBuilder, useDebugText } from '@app/diagnostics';
import { useReportContext } from '@app/hooks/useReportContext';
import { useHubSessionStore } from '@app/stores/hub-session';
import { EMAIL_RE } from '../controller-report.constants';
import type { FiledControllerReport, ReportStep, SubmitStatus } from '@drizztdourden08/brock-input/renderer';
import { buildReportRequest } from './build-report-request';
import { useDetectionContext } from './useDetectionContext';
import { useReportDiagnostics } from './useReportDiagnostics';
import { useReportFields } from './useReportFields';

const useControllerReportForm = (deviceKey: string) => {
  const me = useHubSessionStore((s) => s.me);
  const refreshSession = useHubSessionStore((s) => s.refresh);
  const { subject: subjectPrefix, context } = useReportContext();

  const [step, setStep] = useState<ReportStep>('about');
  const { email, setEmail, emailTouched, name, setName, additionalInfo, setAdditionalInfo, resetFields } = useReportFields();
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [filed, setFiled] = useState<FiledControllerReport | null>(null);

  const detection = useDetectionContext(deviceKey);
  const { buildDebugText } = useDebugTextBuilder();
  const { debugText } = useDebugText(buildDebugText);
  const diagnosticsOpen = step === 'diagnostics' || step === 'confirm';
  const { wizard, diagnosticsReport } = useReportDiagnostics(deviceKey, diagnosticsOpen);
  const calibrationMap = wizard.byteCapture;
  const positionalRecords = wizard.positionalRecords;

  useEffect(() => { void refreshSession(); }, [refreshSession]);

  const emailValid = EMAIL_RE.test(email);
  const identityReady = me !== null || emailValid;
  const canLeaveUserInfo = identityReady;
  const canSubmit = identityReady && calibrationMap !== null && debugText !== null && status !== 'submitting';

  const goToStep = useCallback((to: ReportStep) => setStep(to), []);
  const finishDiagnostics = useCallback(() => setStep('confirm'), []);
  const backToDiagnostics = useCallback(() => setStep('diagnostics'), []);

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    setStatus('submitting');
    try {
      const request = buildReportRequest({
        subjectPrefix, context, me, name, email, additionalInfo, detection, debugText, calibrationMap, positionalRecords, diagnosticsReport,
      });
      const result = await requireHostApi().submitSanctuaryReport({ request });
      if (!('reportId' in result)) {
        setStatus('error');
        return;
      }
      setFiled({ reportId: result.reportId, issueUrl: result.issueUrl, sanctuaryUrl: result.sanctuaryUrl });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }, [canSubmit, calibrationMap, diagnosticsReport, positionalRecords, debugText, me, email, name, additionalInfo, detection, subjectPrefix, context]);

  const reset = useCallback(() => {
    setStep('about');
    resetFields();
    setStatus('idle');
    setFiled(null);
    wizard.restart();
  }, [wizard, resetFields]);

  return {
    step, goToStep, finishDiagnostics, backToDiagnostics, wizard,
    me, email, setEmail, emailTouched, emailValid, canLeaveUserInfo,
    name, setName, additionalInfo, setAdditionalInfo,
    detection, debugText, calibrationMap, diagnosticsReport,
    canSubmit, status, filed, submit, reset,
  };
};

export { useControllerReportForm };
