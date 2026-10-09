/* @layer renderer-appshell @kind logic */
import { spawnLandingTile } from '../../lib/game/flood';
import type { EntranceDataInput, FallHoleLanding, MatchingEntrance } from './dump-nav.type';

const collectEntranceData = (input: EntranceDataInput) => {
  const { roomIndex, entranceRooms, entranceSpawns, fallHoles, owEntrances } = input;

  const fallHoleEntIds = new Set<number>();
  for (const h of fallHoles) fallHoleEntIds.add(h.entranceId);

  const overworldDoorEntIds = new Set<number>();
  for (const e of owEntrances) overworldDoorEntIds.add(e.id);

  const matchingEntrances: MatchingEntrance[] = [];
  const fallHoleLandings: FallHoleLanding[] = [];

  if (entranceRooms && entranceSpawns) {
    const roomOriginX = (roomIndex % 16) * 512;
    const roomOriginY = Math.floor(roomIndex / 16) * 512;
    for (let id = 0; id < entranceRooms.length; id++) {
      if (entranceRooms[id] !== roomIndex) continue;
      const spawn = entranceSpawns[id];
      if (!spawn) continue;
      const gridCol = Math.floor((spawn.x - roomOriginX) / 8);
      const gridRow = Math.floor((spawn.y - roomOriginY) / 8);
      const isFallHole = fallHoleEntIds.has(id);
      const isOverworldDoor = overworldDoorEntIds.has(id);
      const classification = isFallHole ? 'fall-hole' : isOverworldDoor ? 'overworld-door' : 'respawn/special';
      matchingEntrances.push({ id, spawnX: spawn.x, spawnY: spawn.y, gridRow, gridCol, isFallHole, isOverworldDoor, classification });
    }
    for (const h of fallHoles) {
      if (entranceRooms[h.entranceId] === roomIndex) {
        const spawn = entranceSpawns[h.entranceId];
        if (spawn) {
          const { row: gridRow, col: gridCol } = spawnLandingTile(spawn.x, spawn.y, { x: roomOriginX, y: roomOriginY });
          fallHoleLandings.push({ entranceId: h.entranceId, gridRow, gridCol, fromArea: h.area, fromAreaHex: `0x${h.area.toString(16).padStart(2, '0')}` });
        }
      }
    }
  }

  return { matchingEntrances, fallHoleLandings };
};

export { collectEntranceData };
