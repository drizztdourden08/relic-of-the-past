/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import { useDebugTextBuilder, useDebugText } from '@app/lib/diagnostics';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // only requires an @ and a dot with an extension

type SubmitStatus = 'idle' | 'submitting' | 'done' | 'error';

const useBugReportForm = () => {
  const [email, setEmailValue] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const { buildDebugText } = useDebugTextBuilder();
  const { debugText } = useDebugText(buildDebugText);

  const setEmail = useCallback((value: string) => {
    setEmailValue(value);
    setEmailTouched(true);
  }, []);

  const emailValid = EMAIL_RE.test(email);
  const canSubmit = emailValid && subject.trim().length > 0 && description.trim().length > 0
    && debugText !== null && status !== 'submitting';

  const submit = useCallback(async () => {
    if (!canSubmit || debugText === null) return;
    setStatus('submitting');
    try {
      const { url } = await window.api.createGithubIssue({
        email, title: subject, message: description, debugInfo: debugText,
      });
      setResultUrl(url);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }, [canSubmit, email, subject, description, debugText]);

  const reset = useCallback(() => {
    setEmailValue('');
    setEmailTouched(false);
    setSubject('');
    setDescription('');
    setStatus('idle');
    setResultUrl(null);
  }, []);

  return {
    email, setEmail, emailTouched, emailValid,
    subject, setSubject, description, setDescription,
    debugText, canSubmit, status, resultUrl, submit, reset,
  };
};

export { useBugReportForm };
