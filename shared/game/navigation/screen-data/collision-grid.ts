import type { TilePassability, CollisionGrid } from '../types';
import { classifyTileAttr } from '../tile-classification';

/** Build a 64x64 collision grid from Map16 tile data. */
export function buildCollisionGrid(
  map16: Uint16Array,
  map16ToMap8: Uint16Array,
  map8ToAttr: Uint8Array,
): CollisionGrid {
  const tiles: TilePassability[][] = [];
  const rawAttr: number[][] = [];

  for (let row = 0; row < 64; row++) {
    tiles[row] = [];
    rawAttr[row] = [];
    for (let col = 0; col < 64; col++) {
      const map16Row = row >> 1;
      const map16Col = col >> 1;
      const subIdx = (row & 1) * 2 + (col & 1);
      const map16Id = map16[map16Row * 32 + map16Col];
      const map8Entry = map16ToMap8[map16Id * 4 + subIdx];
      const attr = map8ToAttr[map8Entry & 0x1ff];
      rawAttr[row][col] = attr;
      tiles[row][col] = classifyTileAttr(attr);
    }
  }

  return { tiles, rawAttr };
}
