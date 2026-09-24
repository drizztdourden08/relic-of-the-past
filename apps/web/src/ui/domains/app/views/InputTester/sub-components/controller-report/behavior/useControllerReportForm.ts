/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import { useDebugTextBuilder, useDebugText } from '@app/lib/diagnostics';
import { useReportContext } from '@app/lib/diagnostics/useReportContext';
import { useSanctuarySessionStore } from '@app/stores/sanctuary-session';
import type { ReportStep } from '../report-step-labels';
import { useDetectionContext } from './useDetectionContext';
import { useReportDiagnostics } from './useReportDiagnostics';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubmitStatus = 'idle' | 'submitting' | 'done' | 'error';

interface FiledControllerReport {
  reportId: string;
  issueUrl: string;
  sanctuaryUrl: string;
}

const useControllerReportForm = (deviceKey: string) => {
  const me = useSanctuarySessionStore((s) => s.me);
  const refreshSession = useSanctuarySessionStore((s) => s.refresh);
  const { subject: subjectPrefix, context } = useReportContext();

  const [step, setStep] = useState<ReportStep>('about');
  const [email, setEmailValue] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [name, setName] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [filed, setFiled] = useState<FiledControllerReport | null>(null);

  const detection = useDetectionContext(deviceKey);
  const { buildDebugText } = useDebugTextBuilder();
  const { debugText } = useDebugText(buildDebugText);
  // The run stays open through the review step. Closing and reopening it would re-run the
  // wizard's first step, which releases the hold, and only the positional-capture step restores it.
  const diagnosticsOpen = step === 'diagnostics' || step === 'confirm';
  const { wizard, diagnosticsReport } = useReportDiagnostics(deviceKey, diagnosticsOpen);
  const calibrationMap = wizard.byteCapture;
  const positionalRecords = wizard.positionalRecords;

  useEffect(() => { void refreshSession(); }, [refreshSession]);

  const setEmail = useCallback((value: string) => {
    setEmailValue(value);
    setEmailTouched(true);
  }, []);

  const emailValid = EMAIL_RE.test(email);
  const identityReady = me !== null || emailValid;
  const canLeaveUserInfo = identityReady;
  const canSubmit = identityReady && calibrationMap !== null && debugText !== null && status !== 'submitting';

  const goToStep = useCallback((to: ReportStep) => setStep(to), []);
  const finishDiagnostics = useCallback(() => setStep('confirm'), []);

  // Returns to the run's summary with both captures and the restored hold intact; nothing is re-run.
  const backToDiagnostics = useCallback(() => setStep('diagnostics'), []);

  const submit = useCallback(async () => {
    if (!canSubmit || !calibrationMap || debugText === null) return;
    setStatus('submitting');
    try {
      const result = await window.api.submitSanctuaryReport({
        request: {
          kind: 'controller',
          subject: `${subjectPrefix}Controller ${detection.detectedName} (${detection.vendorId}:${detection.productId})`,
          // Only what the reporter wrote; every captured artefact goes through controllerReport below.
          description: [
            !me && name.trim() ? `Reported by: ${name.trim()}` : null,
            additionalInfo.trim() || 'No additional info provided.',
          ].filter(Boolean).join('\n\n'),
          debugInfo: debugText,
          context,
          contactEmail: me ? null : email.trim(),
          controllerReport: {
            detectedName: detection.detectedName,
            sdlMatch: detection.sdlMatch,
            inputApi: detection.inputApi,
            vendorId: detection.vendorId,
            productId: detection.productId,
            hidReport: detection.hidReport,
            calibrationMap: JSON.stringify(calibrationMap, null, 2),
            ...(positionalRecords.length > 0 && { positionalCapture: JSON.stringify(positionalRecords, null, 2) }),
            ...(diagnosticsReport && { diagnosticsReport: JSON.stringify(diagnosticsReport, null, 2) }),
          },
        },
        profileId: null, saves: [], sessionKeys: [],
      });
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
    setEmailValue('');
    setEmailTouched(false);
    setName('');
    setAdditionalInfo('');
    setStatus('idle');
    setFiled(null);
    wizard.restart();
  }, [wizard]);

  return {
    step, goToStep, finishDiagnostics, backToDiagnostics, wizard,
    me, email, setEmail, emailTouched, emailValid, canLeaveUserInfo,
    name, setName, additionalInfo, setAdditionalInfo,
    detection, debugText, calibrationMap, diagnosticsReport,
    canSubmit, status, filed, submit, reset,
  };
};

export { useControllerReportForm };
export type { FiledControllerReport };
