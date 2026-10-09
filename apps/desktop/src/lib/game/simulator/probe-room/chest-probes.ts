/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@shared/game/navigation';
import { getRoomChests } from '../interactables';
import type { RoomFloodRun } from '../flood-room';
import { CHEST_TOUCH_RADIUS } from './probe-room.constants';
import type { RoomProbe } from './probe-room.type';

const neighbourReached = (run: RoomFloodRun | null, tile: GridPos): boolean => {
  for (let dr = -CHEST_TOUCH_RADIUS; dr <= CHEST_TOUCH_RADIUS; dr++) {
    for (let dc = -CHEST_TOUCH_RADIUS; dc <= CHEST_TOUCH_RADIUS; dc++) {
      if ((run?.result.reachable[tile.row + dr]?.[tile.col + dc] ?? 0) > 0) return true;
    }
  }
  return false;
};

const chestProbes = (roomId: number, run: RoomFloodRun | null): RoomProbe['chests'] =>
  getRoomChests(roomId).map((c) => ({
    index: c.chestIndex, row: c.tile.row, col: c.tile.col, opened: c.opened, big: c.isBig, itemId: c.itemId,
    touchable: neighbourReached(run, c.tile),
  }));

export { chestProbes };
