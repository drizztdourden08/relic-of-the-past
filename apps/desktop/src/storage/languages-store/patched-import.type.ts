/* @layer renderer-lib @kind types */
import type { PatchedPartReport, RomLanguage } from '@rotp/asset-extraction';

interface PatchedImportRequest {
  name: string;
  base: RomLanguage;
  credits: string;
  license: string;
  file: File;
}

type PatchedImportResult =
  | { success: true; code: string; parts: PatchedPartReport[] }
  | { success: false; error: string; parts: PatchedPartReport[] };

export type { PatchedImportRequest, PatchedImportResult };
