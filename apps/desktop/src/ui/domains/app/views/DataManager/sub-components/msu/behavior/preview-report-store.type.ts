/* @layer renderer-components @kind types */
import type { LayerReport } from '@rotp/msu';
import type { createPreviewReportStore } from './preview-report-store';

interface PreviewReport {
  key: string;
  elapsedSeconds: number;
  layers: LayerReport[];
  detail: string | null;
}

type ReportedVoice = LayerReport['voices'][number];

type Listener = () => void;

type PreviewReportStore = ReturnType<typeof createPreviewReportStore>;

export type { PreviewReport, ReportedVoice, Listener, PreviewReportStore };
