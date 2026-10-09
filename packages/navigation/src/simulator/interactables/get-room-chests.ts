/* @layer bridge-wasm @kind logic */
import type { SimChest } from '../../simulation';
import { wasmGetRoomChests } from '@rotp/game-core';

const getRoomChests = (roomId: number): SimChest[] =>
  (wasmGetRoomChests(roomId) ?? []).map((c) => ({
    roomId,
    chestIndex: c.chestIndex,
    isBig: c.isBig,
    tile: { row: c.row, col: c.col },
    posKnown: c.posKnown,
    opened: c.isOpen,
    itemId: c.itemId,
  }));

export { getRoomChests };
