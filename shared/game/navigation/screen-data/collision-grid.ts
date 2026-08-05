/* @layer shared-game @kind logic */
import type { TilePassability, CollisionGrid } from '../types';
import { classifyTileAttr } from '../tile-classification';

const buildCollisionGridFromRawAttr = (rawAttr: number[][], indoors = false): CollisionGrid => {
  const tiles: TilePassability[][] = [];
  const outAttr: number[][] = [];

  for (let row = 0; row < 64; row++) {
    tiles[row] = [];
    outAttr[row] = [];
    for (let col = 0; col < 64; col++) {
      const attr = rawAttr[row]?.[col] ?? 0x01;
      outAttr[row][col] = attr;
      tiles[row][col] = classifyTileAttr(attr, indoors);
    }
  }

  return { tiles, rawAttr: outAttr };
};

export { buildCollisionGridFromRawAttr };
