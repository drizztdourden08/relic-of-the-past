/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '../types';
import { wasmGetDialogHookState } from '../bridge/dialog';
import { stampAtCapture } from '../state-stamp';

const toBase64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));

const withDialogState = (mod: EmscriptenModule, data: ArrayBuffer): ArrayBuffer => {
  try {
    const blob = wasmGetDialogHookState(mod);
    return blob ? stampAtCapture(data, { dialog: toBase64(blob) }) : data;
  } catch {
    return data;
  }
};

export { withDialogState };
