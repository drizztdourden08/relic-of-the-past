/* @layer bridge-wasm @kind logic */
import { callPtr, readU16 } from '../wasm-call';
import { PALETTE_COLOURS } from './title.constants';

const wasmGetTitlePalette = (): number[] | null =>
  callPtr('WasmGetTitlePalette', (mod, ptr) => Array.from({ length: PALETTE_COLOURS }, (_, i) => readU16(mod.HEAPU8, ptr + i * 2)));

export { wasmGetTitlePalette };
