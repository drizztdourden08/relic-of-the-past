/* @layer shared-game @kind logic */
import type { TilePassability, CollisionGrid } from '@rotp/game-core';
import { classifyTileAttr } from '../tile-classification';

const buildCollisionGridFromRawAttr = (rawAttr: number[][], indoors = false): CollisionGrid => {
  const outAttr: number[][] = Array.from({ length: 64 }, (_, row) =>
    Array.from({ length: 64 }, (_, col) => rawAttr[row]?.[col] ?? 0x01));
  const tiles: TilePassability[][] = outAttr.map((attrs) => attrs.map((attr) => classifyTileAttr(attr, indoors)));
  return { tiles, rawAttr: outAttr };
};

export { buildCollisionGridFromRawAttr };
