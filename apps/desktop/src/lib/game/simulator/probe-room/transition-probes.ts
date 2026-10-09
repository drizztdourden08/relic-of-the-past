/* @layer bridge-wasm @kind logic */
import { usableEntranceTransition } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import { enrichEntrances } from '../../flood/overworld-entrances';
import type { RoomFloodRun } from '../flood-room';
import type { RoomProbe } from './probe-room.type';

const transitionProbes = (run: RoomFloodRun | null, items: TileReq[]): RoomProbe['transitions'] => {
  const owIds = new Set(enrichEntrances().map((e) => e.id));
  return (run?.result.transitions ?? [])
    .filter((t) => t.edge === 'entrance' && t.entranceIdx != null)
    .map((t) => ({
      idx: t.entranceIdx as number,
      row: t.row,
      col: t.col,
      usable: run ? usableEntranceTransition(run.result, t, items) : false,
      inOwTable: owIds.has(t.entranceIdx as number),
    }));
};

export { transitionProbes };
