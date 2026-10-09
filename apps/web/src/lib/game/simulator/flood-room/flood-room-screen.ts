/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import { summarizeRun } from '../flood-screen';
import type { ScreenFlood } from '../flood-screen';
import { floodRoomRun } from './flood-room-run';

const floodRoomScreen = (roomId: number, startPos?: GridPos, items: TileReq[] = ['lift.1']): ScreenFlood | null => {
  const run = floodRoomRun(roomId, items, startPos);
  return run ? summarizeRun(run, items) : null;
};

export { floodRoomScreen };
