/* @layer renderer-widgets @kind types */
import type { MsuChannelName } from '@app/lib/msu/engine';
import type { PreviewReportStore } from '@domains/app/views/DataManager/sub-components/msu/behavior/preview-report-store';

interface LiveChannel {
  name: MsuChannelName;
  title: string;
  store: PreviewReportStore;
}

export type { LiveChannel };
