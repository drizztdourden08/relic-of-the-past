/* @layer bridge-wasm @kind logic */
import { callPtr } from '../wasm-call';

const wasmGetRoomTravelDestinations = (): number[] | null =>
  callPtr('WasmGetRoomTravelDestinations', (mod, ptr) => {
    const heap = mod.HEAPU8;
    return [heap[ptr], heap[ptr + 1], heap[ptr + 2], heap[ptr + 3], heap[ptr + 4]];
  });

export { wasmGetRoomTravelDestinations };
