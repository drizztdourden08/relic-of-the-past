/* @layer renderer-widgets @kind types */
import type { MsuChannelName, msuChannelReport } from '@rotp/msu';
import type { PreviewReportStore } from '@app/msu-studio/behavior/preview-report-store';

interface LiveChannel {
  name: MsuChannelName;
  title: string;
  store: PreviewReportStore;
}

type ChannelReport = NonNullable<ReturnType<typeof msuChannelReport>>;

interface LayerSlotView {
  empty: boolean;
  sounding: boolean;
  name: string;
  mode: string;
  fill: number;
  label: string;
  flag: string;
  title: string;
}

interface MusicWidgetFeed {
  active: boolean;
  reports: Partial<Record<MsuChannelName, ChannelReport | null>>;
}

declare global {
  interface Window {
    __musicWidgetFeed?: MusicWidgetFeed;
  }
}

export type { ChannelReport, LayerSlotView, LiveChannel, MusicWidgetFeed };
