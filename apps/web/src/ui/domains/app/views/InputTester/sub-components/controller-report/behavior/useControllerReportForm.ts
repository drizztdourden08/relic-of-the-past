/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import { useDebugTextBuilder, useDebugText } from '@app/lib/diagnostics';
import type { HidControllerMap } from '../../hid-calibration/hid-calibration.type';
import { useDetectionContext } from './useDetectionContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = 'intro' | 'user-info' | 'byte-capture' | 'confirm';
type SubmitStatus = 'idle' | 'submitting' | 'done' | 'error';

const useControllerReportForm = (deviceKey: string) => {
  const [step, setStep] = useState<Step>('intro');
  const [email, setEmailValue] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [name, setName] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [calibrationMap, setCalibrationMap] = useState<HidControllerMap | null>(null);
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const detection = useDetectionContext(deviceKey);
  const { buildDebugText } = useDebugTextBuilder();
  const { debugText } = useDebugText(buildDebugText);

  const setEmail = useCallback((value: string) => {
    setEmailValue(value);
    setEmailTouched(true);
  }, []);

  const emailValid = EMAIL_RE.test(email);
  const canLeaveUserInfo = emailValid;
  const canSubmit = emailValid && calibrationMap !== null && debugText !== null && status !== 'submitting';

  const goToByteCapture = useCallback(() => setStep('byte-capture'), []);
  const goToStep = useCallback((to: Step) => setStep(to), []);

  /** Wired as the wizard's onComplete — records the capture instead of finishing calibration. */
  const handleByteCaptureComplete = useCallback((map: HidControllerMap) => {
    setCalibrationMap(map);
    setStep('confirm');
  }, []);

  const submit = useCallback(async () => {
    if (!canSubmit || !calibrationMap || debugText === null) return;
    setStatus('submitting');
    try {
      const { url } = await window.api.createGithubIssue({
        email,
        title: `Controller report: ${detection.detectedName} (${detection.vendorId}:${detection.productId})`,
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
        },
      });
      setResultUrl(url);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }, [canSubmit, calibrationMap, debugText, email, name, additionalInfo, detection]);

  const reset = useCallback(() => {
    setStep('intro');
    setEmailValue('');
    setEmailTouched(false);
    setName('');
    setAdditionalInfo('');
    setCalibrationMap(null);
    setStatus('idle');
    setResultUrl(null);
  }, []);

  return {
    step, goToByteCapture, goToStep,
    email, setEmail, emailTouched, emailValid, canLeaveUserInfo,
    name, setName, additionalInfo, setAdditionalInfo,
    detection, debugText, calibrationMap, handleByteCaptureComplete,
    canSubmit, status, resultUrl, submit, reset,
  };
};

export { useControllerReportForm };
