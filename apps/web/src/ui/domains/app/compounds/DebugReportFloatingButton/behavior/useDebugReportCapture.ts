/* @layer renderer-components @kind hook */
/** Packages whatever save state the player last made (quick, normal, or auto) into a debug
 *  report: gathers it plus the capture recorder's ring buffer, uploads through the main
 *  process, and hands the caller the resulting report id (or an error) to fold into the
 *  bug-report dialog. */
import { useCallback, useState } from 'react';
import { useDebugCaptureStore } from '@app/stores/debug-capture-store';
import { getMostRecentSave } from '@app/lib/diagnostics/most-recent-save';

type CaptureStatus = 'idle' | 'packaging' | 'error';

const useDebugReportCapture = (profileId: string | null) => {
  const [status, setStatus] = useState<CaptureStatus>('idle');

  const sendReport = useCallback(async (): Promise<string | null> => {
    if (!profileId) return null;
    setStatus('packaging');
    try {
      const recent = await getMostRecentSave(profileId);
      if (!recent) { setStatus('error'); return null; }
      const result = await window.api.packageDebugReport({
        profileId,
        source: recent.source,
        saveBuffer: recent.buffer,
        screenshotBase64: recent.screenshotBase64,
        navCaptures: useDebugCaptureStore.getState().drain(),
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
