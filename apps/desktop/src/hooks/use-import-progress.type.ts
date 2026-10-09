/* @layer renderer-other @kind types */
import type { ImportProgress } from '@app/ipc';

type ImportKind = ImportProgress['kind'];
type ImportPhase = ImportProgress['phase'];

interface ImportProgressState {
  active: boolean;
  phase: ImportPhase | null;
  percent: number | null;
  label: string;
}

export type { ImportKind, ImportPhase, ImportProgressState };
