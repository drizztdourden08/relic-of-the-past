/* @layer bridge-wasm @kind logic */
import type { SimSprite } from '../../simulation';
import { wasmGetRoomSpriteSpawns } from '@rotp/game-core';
import { spriteKindFor, standingItemId } from '../sprite-kinds';

const getRoomSprites = (roomId: number): SimSprite[] =>
  (wasmGetRoomSpriteSpawns(roomId) ?? []).map((s) => ({
    roomId,
    spriteType: s.spriteType,
    tile: { row: s.row, col: s.col },
    posKnown: true,
    kind: spriteKindFor(s.spriteType),
    itemId: standingItemId(s.spriteType),
    carriesKey: s.carriesKey,
    carriesBigKey: s.carriesBigKey,
  }));

export { getRoomSprites };
