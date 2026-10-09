/* @layer bridge-wasm @kind logic */
import { callPtr, readU8 } from '../wasm-call';

const wasmGetRoomTravelDestinations = (): number[] | null =>
  callPtr('WasmGetRoomTravelDestinations', (mod, ptr) => Array.from({ length: 5 }, (_v, i) => readU8(mod.HEAPU8, ptr + i)));

export { wasmGetRoomTravelDestinations };
