/* @layer bridge-wasm @kind logic */
import { decodeGatedTable } from '../wasm-call';
import { roomArg } from './room-arg';
import { SPRITE_BIG_KEY_BIT, SPRITE_FLOOR_BIT, SPRITE_SMALL_KEY_BIT } from './sim-queries.constants';
import type { SimSpriteRaw } from './sim-queries.type';

const wasmGetRoomSpriteSpawns = (roomId: number): SimSpriteRaw[] | null =>
  decodeGatedTable('WasmGetRoomSpriteSpawns', { countBytes: 1, dataStart: 2, stride: 4, maxCount: 32 }, (heap, o) => ({
    spriteType: heap[o + 0],
    col: heap[o + 1],
    row: heap[o + 2],
    floor: heap[o + 3] & SPRITE_FLOOR_BIT,
    carriesKey: (heap[o + 3] & SPRITE_SMALL_KEY_BIT) !== 0,
    carriesBigKey: (heap[o + 3] & SPRITE_BIG_KEY_BIT) !== 0,
  }), roomArg(roomId));

export { wasmGetRoomSpriteSpawns };
