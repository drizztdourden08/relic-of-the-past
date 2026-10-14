/* @layer renderer-appshell @kind logic */
import type { EntranceDataInput, MatchingEntrance } from './dump-nav.type';
import { classifyEntrance } from './classify-entrance';

const findMatchingEntrances = (input: EntranceDataInput, origin: { x: number; y: number }): MatchingEntrance[] => {
  const { roomIndex, entranceRooms, entranceSpawns, fallHoles, owEntrances } = input;
  if (!entranceRooms || !entranceSpawns) return [];

  const fallHoleEntIds = new Set(fallHoles.map(h => h.entranceId));
  const overworldDoorEntIds = new Set(owEntrances.map(e => e.id));
  const matching: MatchingEntrance[] = [];

  for (let id = 0; id < entranceRooms.length; id++) {
    const spawn = entranceSpawns[id];
    if (entranceRooms[id] !== roomIndex || !spawn) continue;
    const isFallHole = fallHoleEntIds.has(id);
    const isOverworldDoor = overworldDoorEntIds.has(id);
    matching.push({
      id,
      spawnX: spawn.x,
      spawnY: spawn.y,
      gridRow: Math.floor((spawn.y - origin.y) / 8),
      gridCol: Math.floor((spawn.x - origin.x) / 8),
      isFallHole,
      isOverworldDoor,
      classification: classifyEntrance(isFallHole, isOverworldDoor),
    });
  }
  return matching;
};

export { findMatchingEntrances };
