/* @layer renderer-components @kind types */
import type { FormatCount } from './behavior/useFilePanel.type';

interface PackSummaryProps {
  fileCount: number;
  totalSize: number;
  formats: FormatCount[];
  unusedCount: number;
  supersededCount: number;
  supersededBytes: number;
  optimizeBlockedBecause: string | null;
  busy: boolean;
  onOptimize: () => void;
  onRemoveSuperseded: () => void;
}

export type { PackSummaryProps };
