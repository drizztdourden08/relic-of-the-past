/* @layer bridge-wasm @kind logic */
import { autoSaveState } from './auto-save-state';

const notifyAutoSavesChanged = (): void => {
  for (const fn of autoSaveState.changeListeners) {
    try { fn(); } catch { continue; }
  }
};

export { notifyAutoSavesChanged };
