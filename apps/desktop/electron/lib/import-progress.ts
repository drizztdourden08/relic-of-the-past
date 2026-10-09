/* @layer electron-main @kind logic */
import { emit, getMainWindow } from '@drizztdourden08/brock-electron/main';
import type { ImportKind, ImportPhase, ImportReporter } from './import-progress.type';

const makeImportReporter = (kind: ImportKind, id: string): ImportReporter =>
  (phase, loaded, total, message) => {
    const win = getMainWindow();
    if (win) emit(win, 'import:progress', { kind, id, phase, loaded, total, message });
  };

export { makeImportReporter };
export type { ImportReporter, ImportKind, ImportPhase };
