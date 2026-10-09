/* @layer renderer-widgets @kind logic */
import { wasmGetEntranceSpawns, wasmGetEntranceRooms, wasmGetFallHoles } from '../../../game';
import { spawnLandingTile } from '../../../game/flood';
import { ROOM_GRID_TILES, ROOM_PIXELS, ROOMS_PER_ROW } from '../nav-flood.constants';
import type { FallHoleLanding } from '../nav-flood.type';

const computeFallHoleLandings = (primaryScreenIndex: number, isIndoors: boolean): FallHoleLanding[] => {
  const fallHoleSpawns: FallHoleLanding[] = [];
  if (!isIndoors) return fallHoleSpawns;
  const spawns = wasmGetEntranceSpawns();
  const rooms = wasmGetEntranceRooms();
  const holes = wasmGetFallHoles();
  if (spawns && rooms && holes) {
    const roomOriginX = (primaryScreenIndex % ROOMS_PER_ROW) * ROOM_PIXELS;
    const roomOriginY = Math.floor(primaryScreenIndex / ROOMS_PER_ROW) * ROOM_PIXELS;
    for (const h of holes) {
      if (rooms[h.entranceId] === primaryScreenIndex) {
        const spawn = spawns[h.entranceId];
        if (spawn) {
          const { row: gridRow, col: gridCol } = spawnLandingTile(spawn.x, spawn.y, { x: roomOriginX, y: roomOriginY });
          if (gridRow >= 0 && gridRow < ROOM_GRID_TILES && gridCol >= 0 && gridCol < ROOM_GRID_TILES) {
            fallHoleSpawns.push({ gridRow, gridCol, entranceId: h.entranceId });
          }
        }
      }
    }
  }
  return fallHoleSpawns;
};

export { computeFallHoleLandings };
