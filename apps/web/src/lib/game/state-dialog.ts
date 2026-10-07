/* @layer bridge-wasm @kind logic */
/**
 * The message box across a save and a load.
 *
 * The enhanced box is drawn from statics in the core's dialog hooks, and a save state holds none of
 * them (core/game-hooks/dialog_hook_state.c). A state saved with a message up therefore loads into a
 * game that waits on a button with no words on screen. So the hook state is read on the frame the
 * core saves, travels in the save file's stamp, and goes back in right after the load.
 *
 * A save with no such state (a save with no message up, a closed gate) loads with the store marked
 * stale, and the host box holds back until the next message.
 */
import type { StateStamp } from '@shared/game/save-state';
import { useDialogStore } from '../../stores/dialog-store';
import { wasmGetDialogHookState, wasmRestoreDialogHookState } from './bridge/dialog';
import { resyncDialogFrames } from './dialog/dialog-bridge';
import { stampAtCapture } from './state-stamp';
import type { EmscriptenModule } from './types';

const toBase64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));

const fromBase64 = (text: string): Uint8Array | null => {
  try {
    return Uint8Array.from(atob(text), (ch) => ch.charCodeAt(0));
  } catch {
    return null; // not base64: the same as no dialog state
  }
};

/** Call right after WasmSaveState, before any await, with the bytes it produced. */
const withDialogState = (mod: EmscriptenModule, data: ArrayBuffer): ArrayBuffer => {
  try {
    const blob = wasmGetDialogHookState(mod);
    return blob ? stampAtCapture(data, { dialog: toBase64(blob) }) : data;
  } catch {
    return data; // a core built before the export: the save is still a save
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

/**
 * Call after WasmLoadState and after the live settings are pushed again: the pacing push clears the
 * step credit the restore puts back. |stamp| is the one read off the buffer before it was stripped.
 */
const resumeDialogAfterLoad = (mod: EmscriptenModule, stamp: StateStamp | null): void => {
  const store = useDialogStore.getState();
  if (!restoreDialogState(mod, stamp)) {
    store.markStale();
    return;
  }
  store.markRestored();
  resyncDialogFrames();
};

export { resumeDialogAfterLoad, withDialogState };
