/* @layer renderer-components @kind types */
import type { ImportKind, ImportProgressState } from '@app/hooks/useImportProgress';

interface ImportResult {
  success: boolean;
  message: string;
}

interface ImportFormProps {
  kind: ImportKind;
  placeholder?: string;
  accept?: string[];
  dropLabel?: string;
  dropHint?: string;
  disabled?: boolean;
  onUrlImport: (url: string) => Promise<ImportResult>;
  onFileImport: (files: File[]) => Promise<ImportResult>;
}

type ImportFormSettings = Required<Omit<ImportFormProps, 'dropHint'>> & Pick<ImportFormProps, 'dropHint'>;

interface ImportStatus {
  message: string;
  variant: '' | 'error' | 'success';
}

interface UseImportFormParams {
  kind: ImportKind;
  disabled: boolean;
  onUrlImport: (url: string) => Promise<ImportResult>;
  onFileImport: (files: File[]) => Promise<ImportResult>;
}

interface ImportStatusLineProps {
  busy: boolean;
  progress: ImportProgressState;
  status: ImportStatus;
}

export type {
  ImportFormProps, ImportFormSettings, ImportResult, ImportStatus, ImportStatusLineProps, UseImportFormParams,
};
