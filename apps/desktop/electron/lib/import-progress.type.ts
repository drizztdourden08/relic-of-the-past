/* @layer electron-main @kind types */
import type { ImportProgress } from '@app/ipc';

type ImportKind = ImportProgress['kind'];
type ImportPhase = ImportProgress['phase'];
type ImportReporter = (phase: ImportPhase, loaded?: number, total?: number, message?: string) => void;

export type { ImportKind, ImportPhase, ImportReporter };
