/* @layer bridge-wasm @kind logic */
import { roomEntrances } from '../../flood';
import type { RoomProbe } from '@rotp/navigation';
import type { RoomRun } from './probe-room.type';

const seedRows = (roomId: number, run: RoomRun): RoomProbe['seeds'] =>
  roomEntrances(roomId).map((e) => ({
    id: e.id, row: e.gridRow, col: e.gridCol, dest: e.roomId,
    reached: (run?.result.reachable[e.gridRow]?.[e.gridCol] ?? 0) > 0,
  }));

export { seedRows };
