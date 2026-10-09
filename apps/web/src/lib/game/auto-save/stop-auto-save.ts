/* @layer bridge-wasm @kind logic */
import { autoSaveState } from './auto-save-state';

const stopAutoSave = (): void => {
  if (autoSaveState.interval) {
    clearInterval(autoSaveState.interval);
    autoSaveState.interval = null;
  }
};

export { stopAutoSave };
