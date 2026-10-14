/* @layer bridge-wasm @kind logic */
import { getRoomDoors } from '@rotp/navigation';
import type { RoomProbe } from '@rotp/navigation';

const doorRows = (roomId: number): RoomProbe['doors'] =>
  getRoomDoors(roomId).map((d) => ({
    index: d.index, kind: d.kind, nativeType: d.nativeType, dir: d.direction,
    row: d.tiles[0]?.row ?? -1, col: d.tiles[0]?.col ?? -1, opened: d.opened,
  }));

export { doorRows };
