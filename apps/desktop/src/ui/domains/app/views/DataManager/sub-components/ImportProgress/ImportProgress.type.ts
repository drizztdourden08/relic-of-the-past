/* @layer renderer-components @kind types */
import type { ImportProgressState } from '@app/hooks/useImportProgress';

interface ImportProgressProps {
  state: ImportProgressState;
  fallbackLabel?: string;
}

export type { ImportProgressProps };
