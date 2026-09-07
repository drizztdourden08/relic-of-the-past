/* @layer renderer-components @kind hook */
/** Packages every quick/recent-normal/recent-auto save plus a fresh live capture into a debug
 *  report, along with the capture recorder's ring buffer, uploads through the main process,
 *  and hands the caller the resulting report id (or an error) to fold into the bug-report
 *  dialog. */
import { useCallback, useState } from 'react';
import { useDebugCaptureStore } from '@app/stores/debug-capture-store';
import { collectSaveStates } from '@app/lib/diagnostics/collect-save-states';

type CaptureStatus = 'idle' | 'packaging' | 'error';

const useDebugReportCapture = (profileId: string | null) => {
  const [status, setStatus] = useState<CaptureStatus>('idle');

  const sendReport = useCallback(async (): Promise<string | null> => {
    if (!profileId) return null;
    setStatus('packaging');
    try {
      const saves = await collectSaveStates(profileId);
      if (saves.length === 0) { setStatus('error'); return null; }
      const { snapshots, screenshots } = useDebugCaptureStore.getState().drain();
      const result = await window.api.packageDebugReport({
        profileId,
        saves,
        navCaptures: snapshots,
        captureScreenshots: screenshots,
      });
      if ('error' in result) { setStatus('error'); return null; }
      setStatus('idle');
      return result.reportId;
    } catch {
      setStatus('error');
      return null;
    }
  }, [profileId]);

  return { status, sendReport };
};

export { useDebugReportCapture };
