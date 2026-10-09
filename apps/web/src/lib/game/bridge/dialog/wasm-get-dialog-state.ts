/* @layer bridge-wasm @kind logic */
import { callPtr } from '../wasm-call';
import type { HeapView } from './dialog.type';

const wasmGetDialogState = (): HeapView | null =>
  callPtr('WasmGetDialogState', (mod, ptr) => ({ heap: mod.HEAPU8, ptr }));

export { wasmGetDialogState };
