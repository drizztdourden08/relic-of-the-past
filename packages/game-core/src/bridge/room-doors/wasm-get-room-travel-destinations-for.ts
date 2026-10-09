/* @layer bridge-wasm @kind logic */
import { callPtr, readU8 } from '../wasm-call';

const wasmGetRoomTravelDestinationsFor = (roomId: number): number[] | null =>
  callPtr(
    'WasmGetRoomTravelDestinationsFor',
    (mod, ptr) => Array.from({ length: 5 }, (_v, i) => readU8(mod.HEAPU8, ptr + i)),
    { argTypes: ['number'], args: [roomId] },
  );

export { wasmGetRoomTravelDestinationsFor };
