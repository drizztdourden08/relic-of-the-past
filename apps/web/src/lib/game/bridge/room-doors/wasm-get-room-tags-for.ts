/* @layer bridge-wasm @kind logic */
import { callPtr } from '../wasm-call';

const wasmGetRoomTagsFor = (roomId: number): [number, number] =>
  callPtr('WasmGetRoomTagsFor', (mod, ptr) => [mod.HEAPU8[ptr], mod.HEAPU8[ptr + 1]] as [number, number],
    { argTypes: ['number'], args: [roomId] }) ?? [0, 0];

export { wasmGetRoomTagsFor };
