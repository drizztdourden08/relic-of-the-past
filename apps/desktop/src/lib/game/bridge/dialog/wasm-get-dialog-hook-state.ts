/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '../../types';
import { readU16 } from '../wasm-call';
import { HOOK_STATE_LENGTH_BYTES } from './dialog.constants';

const wasmGetDialogHookState = (mod: EmscriptenModule): Uint8Array | null => {
  const ptr = mod.ccall('WasmGetDialogHookState', 'number', [], []);
  if (!ptr) return null;
  return mod.HEAPU8.slice(ptr + HOOK_STATE_LENGTH_BYTES, ptr + HOOK_STATE_LENGTH_BYTES + readU16(mod.HEAPU8, ptr));
};

export { wasmGetDialogHookState };
