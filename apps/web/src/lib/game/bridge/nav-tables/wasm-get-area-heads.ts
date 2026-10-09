/* @layer bridge-wasm @kind logic */
import { callPtr } from '../wasm-call';
import { AREA_HEAD_COUNT } from './nav-tables.constants';

const wasmGetAreaHeads = (): Uint8Array | null =>
  callPtr('WasmGetAreaHeads', (mod, ptr) => new Uint8Array(mod.HEAPU8.buffer, ptr, AREA_HEAD_COUNT));

export { wasmGetAreaHeads };
