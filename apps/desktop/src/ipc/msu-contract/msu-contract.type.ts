/* @layer shared-ipc @kind types */
import type { OptimizeAnalysis, OptimizeRunResult } from '@rotp/msu';

type MsuResult = {
  success: boolean;
  fileCount?: number;
  error?: string;
  skippedNested?: number;
  skippedDuplicate?: number;
};

interface MsuInvokeContract {
  'msu:readMsulFile': (filePath: string) => Promise<ArrayBuffer>;

  'msu:optimize:analyze': (packName: string) => Promise<OptimizeAnalysis>;
  'msu:optimize:run': (packName: string, fileNames: string[]) => Promise<OptimizeRunResult>;
}

export type { MsuInvokeContract, MsuResult };
