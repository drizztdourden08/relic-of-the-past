/* @layer renderer-components @kind hook */
/** Packages every quick/recent-normal/recent-auto save plus a fresh live capture into a debug
 *  report, along with the capture recorder's ring buffer, uploads through the main process,
 *  and hands the caller the resulting report id (or an error) to fold into the bug-report
 *  dialog. Checks for ffmpeg first (packaging encodes capture screenshots to video when it's
 *  available) and asks the caller to show the install prompt if it isn't; either way the
 *  report still sends once the caller resolves that prompt.
 *
 *  Building (local: collect saves, encode video, zip) and sending (network: upload) are
 *  separate IPC calls. The built zip's token is cached here across retries, so a failed send
 *  - the only step that can fail on something outside this machine, like the rate limit -
 *  retries just the upload instead of re-collecting every save and re-encoding video. */
import { useCallback, useRef, useState } from 'react';
import { useDebugCaptureStore } from '@app/stores/debug-capture-store';
import { collectSaveStates } from '@app/lib/diagnostics/collect-save-states';

type CaptureStatus = 'idle' | 'packaging' | 'sending' | 'error';

const messageOf = (err: unknown, fallback: string): string =>
  (err instanceof Error && err.message.length > 0 ? err.message : fallback);

const useDebugReportCapture = (profileId: string | null) => {
  const [status, setStatus] = useState<CaptureStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showFfmpegPrompt, setShowFfmpegPrompt] = useState(false);
  const tokenRef = useRef<string | null>(null);

  const buildReport = useCallback(async (): Promise<boolean> => {
    if (!profileId) return false;
    setStatus('packaging');
    setErrorMessage(null);
    try {
      const saves = await collectSaveStates(profileId);
      if (saves.length === 0) {
        setStatus('error');
        setErrorMessage('No save state to attach - save your game first.');
        return false;
      }
      const { snapshots, screenshots } = useDebugCaptureStore.getState().drain();
      const result = await window.api.buildDebugReport({
        profileId,
        saves,
        navCaptures: snapshots,
        captureScreenshots: screenshots,
      });
      if ('error' in result) {
        setStatus('error');
        setErrorMessage(result.error);
        return false;
      }
      tokenRef.current = result.token;
      return true;
    } catch (err) {
      setStatus('error');
      setErrorMessage(messageOf(err, 'Could not package the report.'));
      return false;
    }
  }, [profileId]);

  const sendBuiltReport = useCallback(async (): Promise<string | null> => {
    if (!tokenRef.current) return null;
    setStatus('sending');
    setErrorMessage(null);
    try {
      const result = await window.api.sendDebugReport({ token: tokenRef.current });
      if ('error' in result) {
        setStatus('error');
        setErrorMessage(result.error);
        return null;
      }
      tokenRef.current = null;
      setStatus('idle');
      return result.reportId;
    } catch (err) {
      setStatus('error');
      setErrorMessage(messageOf(err, 'Could not send the report.'));
      return null;
    }
  }, []);

  const buildAndSend = useCallback(async (): Promise<string | null> => {
    if (!tokenRef.current) {
      const built = await buildReport();
      if (!built) return null;
    }
    return sendBuiltReport();
  }, [buildReport, sendBuiltReport]);

  const sendReport = useCallback(async (): Promise<string | null> => {
    if (!profileId) return null;
    if (!tokenRef.current) {
      const ffmpeg = await window.api.getFfmpegState().catch(() => null);
      if (ffmpeg?.status !== 'ready') {
        setShowFfmpegPrompt(true);
        return null;
      }
    }
    return buildAndSend();
  }, [profileId, buildAndSend]);

  const resolveFfmpegPrompt = useCallback((): Promise<string | null> => {
    setShowFfmpegPrompt(false);
    return buildAndSend();
  }, [buildAndSend]);

  return { status, errorMessage, sendReport, showFfmpegPrompt, resolveFfmpegPrompt };
};

export { useDebugReportCapture };
