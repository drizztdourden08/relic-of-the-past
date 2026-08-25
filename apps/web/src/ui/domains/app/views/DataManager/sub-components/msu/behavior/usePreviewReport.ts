/* @layer renderer-components @kind hook */
/**
 * Subscribes a single component to the preview's live report.
 *
 * Whatever calls this is the only thing that redraws when a frame is published, which is the whole
 * point: the readout re-renders, the list and the layer editor around it do not.
 *
 * The key asked for is checked against the report, because auditioning one thing while a different
 * one is expanded is normal — the other row's editor must show nothing rather than someone else's
 * layers.
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
