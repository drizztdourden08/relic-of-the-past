import type { CollisionGrid, TilePassability, OverworldEntrance } from '../types';
import type { TileAttrContext } from '../tile-attrs';
import { classifyTileAttr } from '../tile-classification';

/**
 * Abstracts how a 64×64 collision attribute grid is obtained for a given
 * screen (overworld) or room (indoor). Implementations:
 *
 * - WasmGridProvider: calls WASM exports (WasmBuildOverworldAttrGrid / WasmBuildRoomAttrGrid)
 * - CachedGridProvider: loads pre-computed grids from disk (for offline scripts / tests)
 */
export interface GridProvider {
  /**
   * Build a 64×64 raw collision attr grid for an overworld screen.
   * Returns flat row-major uint8 values (same as tile_detect.c output).
   */
  getOverworldRawAttr(screenIndex: number): Uint8Array;

  /**
   * Build a 64×64 raw collision attr grid for an indoor room.
   * Returns flat row-major uint8 values from dung_bg2_attr_table.
   */
  getRoomRawAttr(roomId: number): Uint8Array;
}

/**
 * Provides metadata that the navigation engine needs beyond raw tile collision:
 * - Overworld entrances (screen → entrance list)
 * - Exit screen map (indoor room → overworld screen)
 * - Big screen grouping (which screens form a 2×2 group)
 */
export interface MetadataProvider {
  /** All overworld entrances. */
  getEntrances(): OverworldEntrance[];

  /** Map indoor room ID → overworld screen that exit leads to. */
  getExitScreenMap(): Map<number, number>;

  /** Get the screens in a big-screen group (returns [screenIndex] for small screens). */
  getBigScreenGroup(screenIndex: number): number[];
}

/**
 * Converts a flat Uint8Array of raw attrs (4096 bytes, row-major 64×64)
 * into a CollisionGrid with classified tiles.
 */
export function buildGridFromRawAttr(
  rawAttrFlat: Uint8Array,
  context: TileAttrContext,
): CollisionGrid {
  const tiles: TilePassability[][] = [];
  const rawAttr: number[][] = [];

  for (let row = 0; row < 64; row++) {
    tiles[row] = [];
    rawAttr[row] = [];
    for (let col = 0; col < 64; col++) {
      const attr = rawAttrFlat[row * 64 + col];
      rawAttr[row][col] = attr;
      tiles[row][col] = classifyTileAttr(attr, context);
    }
  }

  return { tiles, rawAttr };
}
