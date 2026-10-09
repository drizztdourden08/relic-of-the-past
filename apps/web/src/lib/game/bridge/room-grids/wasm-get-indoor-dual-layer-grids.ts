/* @layer bridge-wasm @kind logic */
import { callPtr } from '../wasm-call';
import { decodeDualLayers } from './decode-dual-layers';
import type { DualLayerGrids } from './room-grids.type';

const wasmGetIndoorDualLayerGrids = (): DualLayerGrids | null =>
  callPtr('WasmGetIndoorAttrTable', (mod, ptr) => decodeDualLayers(mod.HEAPU8, ptr));

export { wasmGetIndoorDualLayerGrids };
