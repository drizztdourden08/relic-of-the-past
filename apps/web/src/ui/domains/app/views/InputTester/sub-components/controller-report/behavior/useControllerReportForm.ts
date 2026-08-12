/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import { useDebugTextBuilder, useDebugText } from '@app/lib/diagnostics';
import type { ReportStep } from '../report-step-labels';
import { useDetectionContext } from './useDetectionContext';
import { useReportDiagnostics } from './useReportDiagnostics';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubmitStatus = 'idle' | 'submitting' | 'done' | 'error';

const useControllerReportForm = (deviceKey: string) => {
  const [step, setStep] = useState<ReportStep>('about');
  const [email, setEmailValue] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [name, setName] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const detection = useDetectionContext(deviceKey);
  const { buildDebugText } = useDebugTextBuilder();
  const { debugText } = useDebugText(buildDebugText);
  // The run stays open through the review step, not just while its own steps
  // are on screen. Closing it there and opening it again on the way back would
  // re-run the wizard's first step, which releases the hold, while the wizard
  // sat on its summary — and only the positional-capture step ever restores it.
  const diagnosticsOpen = step === 'diagnostics' || step === 'confirm';
  const { wizard, diagnosticsReport } = useReportDiagnostics(deviceKey, diagnosticsOpen);
  const calibrationMap = wizard.byteCapture;
  const positionalRecords = wizard.positionalRecords;

  const setEmail = useCallback((value: string) => {
    setEmailValue(value);
    setEmailTouched(true);
  }, []);

  const emailValid = EMAIL_RE.test(email);
  const canLeaveUserInfo = emailValid;
  const canSubmit = emailValid && calibrationMap !== null && debugText !== null && status !== 'submitting';

  const goToStep = useCallback((to: ReportStep) => setStep(to), []);
  const finishDiagnostics = useCallback(() => setStep('confirm'), []);

  // Returns to the run where it was left, on its summary, with both captures
  // and the restored hold intact. Nothing is re-run, so a reviewer who only
  // wanted another look at the results does not have to redo the whole
  // capture to get back here.
  const backToDiagnostics = useCallback(() => setStep('diagnostics'), []);

  const submit = useCallback(async () => {
    if (!canSubmit || !calibrationMap || debugText === null) return;
    setStatus('submitting');
    try {
      const { url } = await window.api.createGithubIssue({
        email,
        title: `Controller report: ${detection.detectedName} (${detection.vendorId}:${detection.productId})`,
        // Only what the reporter actually wrote. Every captured artefact goes
        // through controllerReport below, so the issue body has one shape.
        message: [
          name.trim() ? `Reported by: ${name.trim()}` : null,
          additionalInfo.trim() || '_No additional info provided._',
        ].filter(Boolean).join('\n\n'),
        debugInfo: debugText,
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
      });
      setResultUrl(url);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }, [canSubmit, calibrationMap, diagnosticsReport, positionalRecords, debugText, email, name, additionalInfo, detection]);

  const reset = useCallback(() => {
    setStep('about');
    setEmailValue('');
    setEmailTouched(false);
    setName('');
    setAdditionalInfo('');
    setStatus('idle');
    setResultUrl(null);
    wizard.restart();
  }, [wizard]);

  return {
    step, goToStep, finishDiagnostics, backToDiagnostics, wizard,
    email, setEmail, emailTouched, emailValid, canLeaveUserInfo,
    name, setName, additionalInfo, setAdditionalInfo,
    detection, debugText, calibrationMap, diagnosticsReport,
    canSubmit, status, resultUrl, submit, reset,
  };
};

export { useControllerReportForm };
