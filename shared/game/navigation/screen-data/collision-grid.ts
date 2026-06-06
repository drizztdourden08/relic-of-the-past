/* @layer shared-game @kind logic */
import type { TilePassability, CollisionGrid } from '../types';
import { classifyTileAttr } from '../tile-classification';
import type { TileAttrContext } from '../tile-attrs';

const buildCollisionGridFromRawAttr = (rawAttr: number[][], context: TileAttrContext = 'overworld'): CollisionGrid => {
  const tiles: TilePassability[][] = [];
  const outAttr: number[][] = [];

  for (let row = 0; row < 64; row++) {
    tiles[row] = [];
    outAttr[row] = [];
    for (let col = 0; col < 64; col++) {
      const attr = rawAttr[row]?.[col] ?? 0x01;
      outAttr[row][col] = attr;
      tiles[row][col] = classifyTileAttr(attr, context);
    }
  }

  return { tiles, rawAttr: outAttr };
};

export { buildCollisionGridFromRawAttr };
