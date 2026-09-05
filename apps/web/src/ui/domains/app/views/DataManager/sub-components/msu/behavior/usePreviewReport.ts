/* @layer renderer-components @kind hook */
/**
 * Subscribes one component to the live report, so only it redraws per frame. The key gets checked
 * because auditioning one thing while another is expanded is normal.
 */
import { useCallback, useSyncExternalStore } from 'react';
import type { PreviewReport, PreviewReportStore } from './preview-report-store';

const usePreviewReport = (store: PreviewReportStore, previewKey: string): PreviewReport | null => {
  const getSnapshot = useCallback((): PreviewReport | null => {
    const report = store.getSnapshot();
    return report !== null && report.key === previewKey ? report : null;
  }, [store, previewKey]);

  return useSyncExternalStore(store.subscribe, getSnapshot);
};

export { usePreviewReport };
