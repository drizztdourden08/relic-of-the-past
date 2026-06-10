/* @layer electron-main @kind logic */
/**
 * Emit data-import progress to the renderer (the `import:progress` event).
 * Each import handler builds a reporter bound to its `{ kind, id }` and calls it
 * at each phase; the renderer's `useImportProgress` hook reduces the stream to a
 * spinner / progress bar. Mirrors `renderer-log.ts` (getMainWindow + emit).
 */
import type { ImportProgress } from '@shared/ipc';
import { getMainWindow } from '../window';
import { emit } from './ipc/handle';

type ImportKind = ImportProgress['kind'];
type ImportPhase = ImportProgress['phase'];
type ImportReporter = (phase: ImportPhase, loaded?: number, total?: number, message?: string) => void;

const makeImportReporter = (kind: ImportKind, id: string): ImportReporter =>
  (phase, loaded, total, message) => {
    const win = getMainWindow();
    if (win) emit(win, 'import:progress', { kind, id, phase, loaded, total, message });
  };

export { makeImportReporter };
export type { ImportReporter, ImportKind, ImportPhase };
