/* @layer bridge-wasm @kind logic */
import { getRoomSprites } from '@rotp/navigation';
import type { RoomProbe } from '@rotp/navigation';

const spriteRows = (roomId: number): RoomProbe['sprites'] =>
  getRoomSprites(roomId).map((sp) => ({
    type: `0x${sp.spriteType.toString(16)}`, row: sp.tile.row, col: sp.tile.col, kind: sp.kind,
    ...(sp.carriesKey ? { carriesKey: true } : {}),
    ...(sp.carriesBigKey ? { carriesBigKey: true } : {}),
  }));

export { spriteRows };
