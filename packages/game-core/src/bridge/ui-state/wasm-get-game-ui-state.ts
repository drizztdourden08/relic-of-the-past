/* @layer bridge-wasm @kind logic */
import { callPtr } from '../wasm-call';
import type { HeapView } from '../dialog';

const wasmGetGameUIState = (): HeapView | null =>
  callPtr('WasmGetGameUIState', (mod, ptr) => ({ heap: mod.HEAPU8, ptr }));

export { wasmGetGameUIState };
