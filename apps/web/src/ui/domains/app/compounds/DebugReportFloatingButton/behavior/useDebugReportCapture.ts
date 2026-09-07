/* @layer renderer-components @kind hook */
/** Packages every quick/recent-normal/recent-auto save plus a fresh live capture into a debug
 *  report zip, along with the capture recorder's ring buffer, and hands the caller the id the
 *  main process is holding it under (or an error) to fold into the bug-report dialog. This is
 *  local-only - nothing uploads here. The zip is only sent once the caller's GitHub issue is
 *  confirmed created, via a direct 'debug-report:send' call elsewhere (useBugReportForm),
 *  which is what makes the id honest to embed in the issue body ahead of time.
 *  Checks for ffmpeg first (packaging encodes capture screenshots to video when it's
 *  available) and asks the caller to show the install prompt if it isn't; either way the
 *  report still builds once the caller resolves that prompt. */
import { useCallback, useState } from 'react';
import { useDebugCaptureStore } from '@app/stores/debug-capture-store';
import { collectSaveStates } from '@app/lib/diagnostics/collect-save-states';

type CaptureStatus = 'idle' | 'packaging' | 'error';

const messageOf = (err: unknown, fallback: string): string =>
  (err instanceof Error && err.message.length > 0 ? err.message : fallback);

const useDebugReportCapture = (profileId: string | null) => {
  const [status, setStatus] = useState<CaptureStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showFfmpegPrompt, setShowFfmpegPrompt] = useState(false);

  const buildReport = useCallback(async (): Promise<string | null> => {
    if (!profileId) return null;
    setStatus('packaging');
    setErrorMessage(null);
    try {
      const saves = await collectSaveStates(profileId);
      if (saves.length === 0) {
        setStatus('error');
        setErrorMessage('No save state to attach - save your game first.');
        return null;
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
        return null;
      }
      setStatus('idle');
      return result.reportId;
    } catch (err) {
      setStatus('error');
      setErrorMessage(messageOf(err, 'Could not package the report.'));
      return null;
    }
  }, [profileId]);

  const packageReport = useCallback(async (): Promise<string | null> => {
    if (!profileId) return null;
    const ffmpeg = await window.api.getFfmpegState().catch(() => null);
    if (ffmpeg?.status !== 'ready') {
      setShowFfmpegPrompt(true);
      return null;
    }
    return buildReport();
  }, [profileId, buildReport]);

  const resolveFfmpegPrompt = useCallback((): Promise<string | null> => {
    setShowFfmpegPrompt(false);
    return buildReport();
  }, [buildReport]);

  return { status, errorMessage, packageReport, showFfmpegPrompt, resolveFfmpegPrompt };
};

export { useDebugReportCapture };
