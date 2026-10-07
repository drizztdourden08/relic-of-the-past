/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import { useDebugTextBuilder, useDebugText } from '@app/lib/diagnostics';
import { collectSaveStates } from '@app/lib/diagnostics/collect-save-states';
import { useReportContext } from '@app/lib/diagnostics/useReportContext';
import { useSanctuarySessionStore } from '@app/stores/sanctuary-session';
import type { DebugReportSaveEntry } from '@shared/types/debug-report';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // only requires an @ and a dot with an extension

type SubmitStatus = 'idle' | 'submitting' | 'done' | 'error';
type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

interface FiledReport {
  reportId: string;
  issueUrl: string;
  sanctuaryUrl: string;
}

const messageOf = (err: unknown, fallback: string): string =>
  (err instanceof Error && err.message.length > 0 ? err.message : fallback);

/** `profileId` is only set when debug logging is on and a profile is active (see
 *  BugReportDialog); that is the whole gate for whether a debug report is attempted at all.
 *  The main process builds the zip at submit time, from the saves collected here and the
 *  sessions the picker had checked, files the report and uploads the zip in one call. A
 *  failed upload leaves the report filed and can be retried against the same report id. */
const useBugReportForm = (profileId: string | null, sessionKeys: string[]) => {
  const me = useSanctuarySessionStore((s) => s.me);
  const refreshSession = useSanctuarySessionStore((s) => s.refresh);
  const { subject: prefilledSubject, context } = useReportContext();

  const [email, setEmailValue] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [editedSubject, setEditedSubject] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [filed, setFiled] = useState<FiledReport | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { buildDebugText } = useDebugTextBuilder();
  const { debugText } = useDebugText(buildDebugText);

  useEffect(() => { void refreshSession(); }, [refreshSession]);

  const setEmail = useCallback((value: string) => {
    setEmailValue(value);
    setEmailTouched(true);
  }, []);

  // The subject follows the running game until the person edits it.
  const subject = editedSubject ?? prefilledSubject;
  const setSubject = useCallback((value: string) => setEditedSubject(value), []);

  const emailValid = EMAIL_RE.test(email);
  const identityReady = me !== null || emailValid;
  const canSubmit = identityReady && subject.trim().length > 0 && description.trim().length > 0
    && debugText !== null && status !== 'submitting';

  const collectSaves = useCallback(async (): Promise<DebugReportSaveEntry[]> => {
    if (!profileId) return [];
    try {
      return await collectSaveStates(profileId);
    } catch {
      return [];
    }
  }, [profileId]);

  const submit = useCallback(async () => {
    if (!canSubmit || debugText === null) return;
    setStatus('submitting');
    setSubmitError(null);
    try {
      const saves = await collectSaves();
      const result = await window.api.submitSanctuaryReport({
        request: {
          kind: 'player', subject: subject.trim(), description: description.trim(), debugInfo: debugText,
          context, contactEmail: me ? null : email.trim(),
        },
        profileId, saves, sessionKeys,
      });
      if (!('reportId' in result)) {
        setStatus('error');
        setSubmitError(result.error);
        return;
      }
      setFiled({ reportId: result.reportId, issueUrl: result.issueUrl, sanctuaryUrl: result.sanctuaryUrl });
      setUploadStatus(result.attached ? (result.uploaded ? 'done' : 'error') : 'idle');
      setUploadError(result.error ?? null);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setSubmitError(messageOf(err, 'Could not file the report.'));
    }
  }, [canSubmit, debugText, collectSaves, subject, description, context, me, email, profileId, sessionKeys]);

  const retryUpload = useCallback(async () => {
    if (!filed) return;
    setUploadStatus('uploading');
    setUploadError(null);
    try {
      const result = await window.api.retrySanctuaryUpload({ reportId: filed.reportId });
      setUploadStatus(result.uploaded ? 'done' : 'error');
      setUploadError(result.error ?? null);
    } catch (err) {
      setUploadStatus('error');
      setUploadError(messageOf(err, 'Could not upload the debug report.'));
    }
  }, [filed]);

  const reset = useCallback(() => {
    setEmailValue('');
    setEmailTouched(false);
    setEditedSubject(null);
    setDescription('');
    setStatus('idle');
    setSubmitError(null);
    setFiled(null);
    setUploadStatus('idle');
    setUploadError(null);
  }, []);

  return {
    me, email, setEmail, emailTouched, emailValid,
    subject, setSubject, description, setDescription,
    debugText, canSubmit, status, submitError, submit, reset,
    filed, uploadStatus, uploadError, retryUpload,
  };
};

export { useBugReportForm };
export type { FiledReport, UploadStatus };
