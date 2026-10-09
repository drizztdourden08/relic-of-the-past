/* @layer bridge-wasm @kind logic */
import { autoSaveState } from './auto-save-state';

const onAutoSavesChanged = (fn: () => void): (() => void) => {
  autoSaveState.changeListeners.add(fn);
  return () => autoSaveState.changeListeners.delete(fn);
};

export { onAutoSavesChanged };
