/* @layer renderer-appshell @kind logic */
import { spawnLandingTile } from '@app/game/flood';
import type { EntranceDataInput, FallHoleLanding } from './dump-nav.type';
import { hex } from './hex';

const findFallHoleLandings = (input: EntranceDataInput, origin: { x: number; y: number }): FallHoleLanding[] => {
  const { roomIndex, entranceRooms, entranceSpawns, fallHoles } = input;
  if (!entranceRooms || !entranceSpawns) return [];

  const landings: FallHoleLanding[] = [];
  for (const h of fallHoles) {
    const spawn = entranceSpawns[h.entranceId];
    if (entranceRooms[h.entranceId] !== roomIndex || !spawn) continue;
    const { row: gridRow, col: gridCol } = spawnLandingTile(spawn.x, spawn.y, origin);
    landings.push({ entranceId: h.entranceId, gridRow, gridCol, fromArea: h.area, fromAreaHex: hex(h.area, 2) });
  }
  return landings;
};

export { findFallHoleLandings };
