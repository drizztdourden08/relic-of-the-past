/* @layer bridge-wasm @kind logic */
import { callPtr } from '../wasm-call';
import { decodeDualLayers } from './decode-dual-layers';
import type { DualLayerGrids } from './room-grids.type';

const wasmBuildRoomDualLayerGrids = (roomId: number): DualLayerGrids | null =>
  callPtr('WasmBuildRoomAttrGrid', (mod, ptr) => decodeDualLayers(mod.HEAPU8, ptr), { argTypes: ['number'], args: [roomId] });

export { wasmBuildRoomDualLayerGrids };
