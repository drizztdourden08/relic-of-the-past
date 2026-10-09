/* @layer bridge-wasm @kind logic */
import { callPtr } from '../wasm-call';
import { POLY_BYTES } from './title.constants';

const wasmGetTitlePoly = (): Uint8Array | null =>
  callPtr('WasmGetTitlePoly', (mod, ptr) => mod.HEAPU8.subarray(ptr, ptr + POLY_BYTES));

export { wasmGetTitlePoly };
