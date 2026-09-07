/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import { useDebugTextBuilder, useDebugText } from '@app/lib/diagnostics';
import { collectSaveStates } from '@app/lib/diagnostics/collect-save-states';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // only requires an @ and a dot with an extension

type SubmitStatus = 'idle' | 'submitting' | 'done' | 'error';
type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

const messageOf = (err: unknown, fallback: string): string =>
  (err instanceof Error && err.message.length > 0 ? err.message : fallback);

/** `profileId` is only set when debug logging is on and a profile is active (see
 *  BugReportDialog) - that's the whole gate for whether a debug report is attempted at all.
 *  Packaging now happens at submit time, against whatever the session picker had checked
 *  (`sessionKeys`), not ahead of time: nothing is zipped or touched on disk until the player
 *  actually files the report, and a failure packaging it degrades to a plain issue instead of
 *  blocking submission. The upload itself only fires once the GitHub issue is confirmed
 *  created, so the id is honest to embed in the issue body ahead of time, and can be retried
 *  on its own (network failure only) without repackaging. */
const useBugReportForm = (profileId: string | null, sessionKeys: string[]) => {
  const [email, setEmailValue] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [attachError, setAttachError] = useState<string | null>(null);
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

  const uploadDebugReport = useCallback(async (id: string) => {
    setUploadStatus('uploading');
    setUploadError(null);
    try {
      const result = await window.api.sendDebugReport({ reportId: id });
      if ('error' in result) {
        setUploadStatus('error');
        setUploadError(result.error);
        return;
      }
      setUploadStatus('done');
    } catch (err) {
      setUploadStatus('error');
      setUploadError(messageOf(err, 'Could not upload the debug report.'));
    }
  }, []);

  const retryUpload = useCallback(() => {
    if (reportId) void uploadDebugReport(reportId);
  }, [reportId, uploadDebugReport]);

  /** Nothing to attach (debug logging off, or a profile with no saves and no checked
   *  recordings) is not a failure - it just means the issue files plain, same as before this
   *  picker existed. An actual build error still surfaces, but doesn't block filing. */
  const packageDebugReport = useCallback(async (): Promise<string | null> => {
    if (!profileId) return null;
    try {
      const saves = await collectSaveStates(profileId);
      if (saves.length === 0 && sessionKeys.length === 0) return null;
      const result = await window.api.buildDebugReport({ profileId, saves, sessionKeys });
      if ('error' in result) {
        setAttachError(result.error);
        return null;
      }
      return result.reportId;
    } catch (err) {
      setAttachError(messageOf(err, 'Could not package the debug report.'));
      return null;
    }
  }, [profileId, sessionKeys]);

  const submit = useCallback(async () => {
    if (!canSubmit || debugText === null) return;
    setStatus('submitting');
    setAttachError(null);
    try {
      const builtReportId = await packageDebugReport();
      const fullDebugInfo = builtReportId ? `${debugText}\n\ndebug-report-id: ${builtReportId}` : debugText;
      const { url } = await window.api.createGithubIssue({
        email, title: subject, message: description, debugInfo: fullDebugInfo,
      });
      setResultUrl(url);
      setReportId(builtReportId);
      setStatus('done');
      if (builtReportId) void uploadDebugReport(builtReportId);
    } catch {
      setStatus('error');
    }
  }, [canSubmit, email, subject, description, debugText, packageDebugReport, uploadDebugReport]);

  const reset = useCallback(() => {
    setEmailValue('');
    setEmailTouched(false);
    setSubject('');
    setDescription('');
    setStatus('idle');
    setResultUrl(null);
    setReportId(null);
    setAttachError(null);
    setUploadStatus('idle');
    setUploadError(null);
  }, []);

  return {
    email, setEmail, emailTouched, emailValid,
    subject, setSubject, description, setDescription,
    debugText, canSubmit, status, resultUrl, submit, reset,
    reportId, attachError, uploadStatus, uploadError, retryUpload,
  };
};

export { useBugReportForm };
