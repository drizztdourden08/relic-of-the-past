/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
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
  children?: ReactNode;
  onUrlImport: (url: string) => Promise<ImportResult>;
  onFileImport: (files: File[]) => Promise<ImportResult>;
}

type ImportFormSettings = Required<Omit<ImportFormProps, 'dropHint' | 'children'>> & Pick<ImportFormProps, 'dropHint' | 'children'>;

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
