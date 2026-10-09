/* @layer bridge-wasm @kind logic */
import type { SimSprite } from '../../simulation';
import { wasmGetOverworldSpriteSpawns, wasmGetAreaHeads } from '@rotp/game-core';
import { spriteKindFor, standingItemId } from '../sprite-kinds';
import { resolveAreaSprite } from '../overworld-area';

const getOverworldSprites = (screenIndex: number): SimSprite[] => {
  const heads = wasmGetAreaHeads();
  return (wasmGetOverworldSpriteSpawns(screenIndex) ?? []).map((s) => {
    const resolved = heads ? resolveAreaSprite(screenIndex, { row: s.row, col: s.col }, heads) : { screenIndex, tile: { row: s.row, col: s.col } };
    return {
      roomId: resolved.screenIndex,
      outdoor: true,
      spriteType: s.spriteType,
      tile: resolved.tile,
      posKnown: true,
      kind: spriteKindFor(s.spriteType),
      itemId: standingItemId(s.spriteType),
    };
  });
};

export { getOverworldSprites };
