/* @layer renderer-lib @kind types */
import type { MsuPackManifest } from '@shared/types/msu-manifest';

interface Msu1ExportProgress {
  trackNum: number;
  done: number;
  total: number;
}

interface ExportMsu1Params {
  manifest: MsuPackManifest;
  loadBuffer: (fileName: string) => Promise<AudioBuffer | null>;
  baseName: string;
  onProgress?: (progress: Msu1ExportProgress) => void;
  seed?: number;
}

export type { ExportMsu1Params, Msu1ExportProgress };
