/* @layer bridge-wasm @kind logic */
import { callPtr } from '../wasm-call';
import { ROOM_TILES } from './room-grids.constants';

const wasmBuildRoomAttrGrid = (roomId: number): Uint8Array | null =>
  callPtr('WasmBuildRoomAttrGrid', (mod, ptr) => new Uint8Array(mod.HEAPU8.buffer, ptr, ROOM_TILES * ROOM_TILES), { argTypes: ['number'], args: [roomId] });

export { wasmBuildRoomAttrGrid };
