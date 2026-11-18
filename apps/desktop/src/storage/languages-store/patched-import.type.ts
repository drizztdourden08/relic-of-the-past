/* @layer renderer-lib @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';
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
  | { success: false; error: Text; parts: PatchedPartReport[] };

export type { PatchedImportRequest, PatchedImportResult };
