/* @layer renderer-components @kind hook */
import { useCallback, useSyncExternalStore } from 'react';
import type { PreviewReport, PreviewReportStore } from './preview-report-store.type';

const usePreviewReport = (store: PreviewReportStore, previewKey: string): PreviewReport | null => {
  const getSnapshot = useCallback((): PreviewReport | null => {
    const report = store.getSnapshot();
    return report !== null && report.key === previewKey ? report : null;
  }, [store, previewKey]);

  return useSyncExternalStore(store.subscribe, getSnapshot);
};

export { usePreviewReport };
