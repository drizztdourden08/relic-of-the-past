/* @layer bridge-wasm @kind logic */
import { callPtr } from '../wasm-call';

const wasmGetRoomTravelDestinationsFor = (roomId: number): number[] | null =>
  callPtr('WasmGetRoomTravelDestinationsFor', (mod, ptr) => {
    const heap = mod.HEAPU8;
    return [heap[ptr], heap[ptr + 1], heap[ptr + 2], heap[ptr + 3], heap[ptr + 4]];
  }, { argTypes: ['number'], args: [roomId] });

export { wasmGetRoomTravelDestinationsFor };
