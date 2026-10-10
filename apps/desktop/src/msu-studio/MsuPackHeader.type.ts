/* @layer renderer-components @kind types */
import type { ExportFormat } from './behavior/pack-export.type';
import type { PackFormat } from './msu.type';

interface MsuPackHeaderProps {
  pack: string;
  format: PackFormat;
  slotCount: number;
  fileCount: number;
  totalSize: number;
  isDeluxe: boolean;
  hasOpuz: boolean;
  busy: boolean;
  readOnly: boolean;
  exporting: ExportFormat | null;
  onRename: (name: string) => void;
  onExport: (format: ExportFormat) => void;
}

export type { MsuPackHeaderProps };
