/* @layer bridge-wasm @kind logic */
import type { OverworldEntrance } from '@shared/game/navigation';
import {
  wasmGetOverworldEntrances, wasmGetFallHoles, wasmGetEntranceRooms, wasmGetAreaHeads,
} from '../../';
import { FALL_HOLE_ID_BASE, FALL_HOLE_ROW_OFFSET } from './overworld-entrances.constants';
import { resolveToSubScreen } from './resolve-to-sub-screen';

const enrichEntrances = (): OverworldEntrance[] => {
  const raw = wasmGetOverworldEntrances();
  const rooms = wasmGetEntranceRooms();
  const heads = wasmGetAreaHeads();

  const entrances: OverworldEntrance[] = raw.map((e) => ({
    ...resolveToSubScreen(heads, e.area, (e.pos >> 7) * 2, ((e.pos & 0x7f) >> 1) * 2),
    pos: e.pos,
    id: e.id,
    roomId: rooms?.[e.id] ?? 0,
  }));
  for (const hole of wasmGetFallHoles()) {
    entrances.push({
      ...resolveToSubScreen(heads, hole.area, ((hole.pos >> 7) + FALL_HOLE_ROW_OFFSET) * 2, ((hole.pos & 0x7f) >> 1) * 2),
      pos: hole.pos,
      id: FALL_HOLE_ID_BASE + hole.entranceId,
      roomId: rooms?.[hole.entranceId] ?? 0,
    });
  }
  return entrances;
};

export { enrichEntrances };
