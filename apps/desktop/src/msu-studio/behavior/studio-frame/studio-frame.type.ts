/* @layer renderer-components @kind types */
import type { ExportFormat } from '../pack-export.type';

type StudioActionsParams = {
  busy: boolean;
  exporting: ExportFormat | null;
  onExport: (format: ExportFormat) => void;
};

export type { StudioActionsParams };
