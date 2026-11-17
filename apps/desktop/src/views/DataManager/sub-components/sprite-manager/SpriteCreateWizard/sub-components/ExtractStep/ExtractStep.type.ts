/* @layer renderer-components @kind types */
import type { ImportProgressState } from '@app/hooks/useImportProgress';

interface ExtractStepProps {
  romFile: string;
  busy: boolean;
  progress: ImportProgressState;
}

export type { ExtractStepProps };
