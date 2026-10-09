/* @layer bridge-wasm @kind logic */
import type { StateStamp } from '@shared/game/save-state';
import type { EmscriptenModule } from '../types';
import { useDialogStore } from '../../../stores/dialog-store';
import { wasmRestoreDialogHookState } from '../bridge/dialog';
import { resyncDialogFrames } from '../dialog/dialog-bridge';

const fromBase64 = (text: string): Uint8Array | null => {
  try {
    return Uint8Array.from(atob(text), (ch) => ch.charCodeAt(0));
  } catch {
    return null;
  }
};

const restoreDialogState = (mod: EmscriptenModule, stamp: StateStamp | null): boolean => {
  const blob = stamp?.dialog ? fromBase64(stamp.dialog) : null;
  if (!blob) return false;
  try {
    return wasmRestoreDialogHookState(mod, blob);
  } catch {
    return false;
  }
};

const resumeDialogAfterLoad = (mod: EmscriptenModule, stamp: StateStamp | null): void => {
  const store = useDialogStore.getState();
  if (!restoreDialogState(mod, stamp)) {
    store.markStale();
    return;
  }
  store.markRestored();
  resyncDialogFrames();
};

export { resumeDialogAfterLoad };
