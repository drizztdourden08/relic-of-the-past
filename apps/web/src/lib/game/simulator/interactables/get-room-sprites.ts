/* @layer bridge-wasm @kind logic */
import type { SimSprite } from '@shared/game/simulation';
import { wasmGetRoomSpriteSpawns } from '../../';
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
