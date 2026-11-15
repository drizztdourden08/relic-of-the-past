/* @layer renderer-components @kind types */
import type { RomLanguage } from '@rotp/asset-extraction';

interface PatchedImportFields {
  name: string;
  base: RomLanguage;
  credits: string;
  file: File;
}

interface PatchedImportFormProps {
  busy: boolean;
  error: string | null;
  onImport: (fields: PatchedImportFields) => Promise<boolean>;
}

export type { PatchedImportFields, PatchedImportFormProps };
