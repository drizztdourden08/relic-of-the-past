/* @layer renderer-widgets @kind logic */
import { wasmGetEntranceSpawns, wasmGetEntranceRooms, wasmGetFallHoles } from '../../../game';
import { ROOM_PIXELS, ROOMS_PER_ROW } from '../nav-flood.constants';
import type { FallHoleLanding } from '../nav-flood.type';
import { landingOf } from './landing-of';

const computeFallHoleLandings = (primaryScreenIndex: number, isIndoors: boolean): FallHoleLanding[] => {
  if (!isIndoors) return [];
  const spawns = wasmGetEntranceSpawns();
  const rooms = wasmGetEntranceRooms();
  if (!spawns || !rooms) return [];
  const origin = {
    x: (primaryScreenIndex % ROOMS_PER_ROW) * ROOM_PIXELS,
    y: Math.floor(primaryScreenIndex / ROOMS_PER_ROW) * ROOM_PIXELS,
  };
  return wasmGetFallHoles()
    .filter((hole) => rooms[hole.entranceId] === primaryScreenIndex)
    .flatMap((hole) => landingOf(hole.entranceId, spawns[hole.entranceId], origin) ?? []);
};

export { computeFallHoleLandings };
