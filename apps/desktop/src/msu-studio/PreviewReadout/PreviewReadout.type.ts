/* @layer renderer-components @kind types */
import type { LayerReport } from '@rotp/msu';
import type { PreviewReportStore } from '../behavior/preview-report-store.type';

type ReportedVoice = LayerReport['voices'][number];

type LayerMeterKind = 'voice' | 'next';

interface FadeMeter {
  kind: 'in' | 'out';
  fill: number;
  label: string;
}

interface LayerMeterRow {
  id: string;
  kind: LayerMeterKind;
  caption: string;
  title: string | null;
  fill: number | null;
  label: string;
  fade: FadeMeter | null;
  introFill?: number | null;
}

interface LayerMeters {
  voices: LayerMeterRow[];
  next: LayerMeterRow | null;
}

interface MeterRowProps {
  row: LayerMeterRow;
}

interface FadeChipProps {
  fade: FadeMeter;
}

interface LayerMeterProps {
  report: LayerReport;
  showName?: boolean;
}

interface PreviewReadoutProps {
  store: PreviewReportStore;
  previewKey: string;
  label: string;
}

interface LayerLiveProps {
  store: PreviewReportStore;
  previewKey: string;
  layerId: string;
}

interface VoiceCaption {
  caption: string;
  title: string | null;
}

export type {
  ReportedVoice,
  FadeMeter,
  LayerMeterRow,
  LayerMeters,
  MeterRowProps,
  FadeChipProps,
  LayerMeterProps,
  PreviewReadoutProps,
  LayerLiveProps,
  VoiceCaption,
};
