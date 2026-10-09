/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '../../types';

const wasmRestoreDialogHookState = (mod: EmscriptenModule, blob: Uint8Array): boolean =>
  mod.ccall('WasmRestoreDialogHookState', 'number', ['array', 'number'], [blob, blob.length]) === 1;

export { wasmRestoreDialogHookState };
