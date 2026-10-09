/* @layer renderer-components @kind types */
import type { ImportKind } from '@app/hooks/useImportProgress';

interface ImportFormProps {
  kind: ImportKind;
  placeholder?: string;
  accept?: string[];
  dropLabel?: string;
  dropHint?: string;
  disabled?: boolean;
  onUrlImport: (url: string) => Promise<{ success: boolean; message: string }>;
  onFileImport: (files: File[]) => Promise<{ success: boolean; message: string }>;
}

export type { ImportFormProps };
