import type { GridProvider } from '@shared/game/navigation/providers/grid-provider';
import { wasmBuildOverworldAttrGrid, wasmBuildRoomAttrGrid } from '../game/wasm-bridge';

/**
 * GridProvider backed by live WASM exports.
 * Calls WasmBuildOverworldAttrGrid / WasmBuildRoomAttrGrid to build
 * 64×64 collision grids on demand from the compiled zelda3_assets.dat.
 */
export class WasmGridProvider implements GridProvider {
  getOverworldRawAttr(screenIndex: number): Uint8Array {
    const result = wasmBuildOverworldAttrGrid(screenIndex);
    if (!result) {
      throw new Error(`WasmGridProvider: failed to build overworld grid for screen ${screenIndex}`);
    }
    // Copy out of WASM heap (buffer may be invalidated by next WASM call)
    return new Uint8Array(result);
  }

  getRoomRawAttr(roomId: number): Uint8Array {
    const result = wasmBuildRoomAttrGrid(roomId);
    if (!result) {
      throw new Error(`WasmGridProvider: failed to build room grid for room ${roomId}`);
    }
    return new Uint8Array(result);
  }
}
