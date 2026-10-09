/* @layer electron-main @kind logic */
import { getMainWindow } from '../window';
import { emit } from './ipc/handle';
import type { ImportKind, ImportPhase, ImportReporter } from './import-progress.type';

const makeImportReporter = (kind: ImportKind, id: string): ImportReporter =>
  (phase, loaded, total, message) => {
    const win = getMainWindow();
    if (win) emit(win, 'import:progress', { kind, id, phase, loaded, total, message });
  };

export { makeImportReporter };
export type { ImportReporter, ImportKind, ImportPhase };
