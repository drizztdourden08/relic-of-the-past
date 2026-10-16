/* @layer renderer-components @kind types */
import type { StudioTab } from '../../sound-labels';
import type { ExportFormat } from '../pack-export.type';

type StudioActionsParams = {
  hasPack: boolean;
  busy: boolean;
  exporting: ExportFormat | null;
  onExport: (format: ExportFormat) => void;
};

type StudioToolbarParams = {
  tab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
};

export type { StudioActionsParams, StudioToolbarParams };
