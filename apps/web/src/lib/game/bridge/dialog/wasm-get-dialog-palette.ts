/* @layer bridge-wasm @kind logic */
import { callPtr, readU16 } from '../wasm-call';

const wasmGetDialogPalette = (): number[] | null =>
  callPtr('WasmGetDialogPalette', (mod, ptr) => [0, 1, 2, 3].map((i) => readU16(mod.HEAPU8, ptr + i * 2)));

export { wasmGetDialogPalette };
