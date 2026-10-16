/* @layer renderer-other @kind types */
import type { ImportKind } from '@app/storage/import-job';

interface ImportProgressState {
  active: boolean;
  percent: number | null;
  label: string;
}

export type { ImportKind, ImportProgressState };
