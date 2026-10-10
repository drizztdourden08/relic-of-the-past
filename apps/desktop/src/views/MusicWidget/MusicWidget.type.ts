/* @layer renderer-widgets @kind types */
import type { MsuChannelName } from '@rotp/msu';
import type { PreviewReportStore } from '@app/msu-studio/behavior/preview-report-store';

interface LiveChannel {
  name: MsuChannelName;
  title: string;
  store: PreviewReportStore;
}

export type { LiveChannel };
