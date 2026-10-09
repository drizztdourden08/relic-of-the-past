/* @layer renderer-widgets @kind types */
import type { MsuChannelName } from '@rotp/msu';
import type { PreviewReportStore } from '@app/views/DataManager/sub-components/msu/behavior/preview-report-store';

interface LiveChannel {
  name: MsuChannelName;
  title: string;
  store: PreviewReportStore;
}

export type { LiveChannel };
