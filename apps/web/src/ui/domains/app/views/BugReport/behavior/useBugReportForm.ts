/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import { useDebugTextBuilder, useDebugText } from '@app/lib/diagnostics';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // only requires an @ and a dot with an extension

type SubmitStatus = 'idle' | 'submitting' | 'done' | 'error';
type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

const uploadMessageOf = (err: unknown): string =>
  (err instanceof Error && err.message.length > 0 ? err.message : 'Could not upload the debug report.');

/** debugReportId only names a zip already packaged locally (see DebugReportFloatingButton) -
 *  nothing has been sent anywhere yet. It's folded into the issue body so the id is honest
 *  once the report does upload, then the upload itself only fires after the GitHub issue is
 *  confirmed created: nothing leaves this machine if the user cancels the form. */
const useBugReportForm = (debugReportId?: string | null) => {
  const [email, setEmailValue] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { buildDebugText } = useDebugTextBuilder();
  const { debugText } = useDebugText(buildDebugText);

  const setEmail = useCallback((value: string) => {
    setEmailValue(value);
    setEmailTouched(true);
  }, []);

  const emailValid = EMAIL_RE.test(email);
  const canSubmit = emailValid && subject.trim().length > 0 && description.trim().length > 0
    && debugText !== null && status !== 'submitting';

  const uploadDebugReport = useCallback(async (reportId: string) => {
    setUploadStatus('uploading');
    setUploadError(null);
    try {
      const result = await window.api.sendDebugReport({ reportId });
      if ('error' in result) {
        setUploadStatus('error');
        setUploadError(result.error);
        return;
      }
      setUploadStatus('done');
    } catch (err) {
      setUploadStatus('error');
      setUploadError(uploadMessageOf(err));
    }
  }, []);

  const retryUpload = useCallback(() => {
    if (debugReportId) void uploadDebugReport(debugReportId);
  }, [debugReportId, uploadDebugReport]);

  const submit = useCallback(async () => {
    if (!canSubmit || debugText === null) return;
    setStatus('submitting');
    try {
      const fullDebugInfo = debugReportId ? `${debugText}\n\ndebug-report-id: ${debugReportId}` : debugText;
      const { url } = await window.api.createGithubIssue({
        email, title: subject, message: description, debugInfo: fullDebugInfo,
      });
      setResultUrl(url);
      setStatus('done');
      if (debugReportId) void uploadDebugReport(debugReportId);
    } catch {
      setStatus('error');
    }
  }, [canSubmit, email, subject, description, debugText, debugReportId, uploadDebugReport]);

  const reset = useCallback(() => {
    setEmailValue('');
    setEmailTouched(false);
    setSubject('');
    setDescription('');
    setStatus('idle');
    setResultUrl(null);
    setUploadStatus('idle');
    setUploadError(null);
  }, []);

  return {
    email, setEmail, emailTouched, emailValid,
    subject, setSubject, description, setDescription,
    debugText, canSubmit, status, resultUrl, submit, reset,
    uploadStatus, uploadError, retryUpload,
  };
};

export { useBugReportForm };
