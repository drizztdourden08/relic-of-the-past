/* @layer renderer-widgets @kind logic */
import { wasmGetEntranceRooms } from '../../../game';
import { roomEntrances, STAIR_ID_BASE } from '../../../game/flood';
import { FALL_HOLE_ENTRANCE_ID_FROM } from './nav-flood.constants';
import type { CollectArgs } from './nav-flood.type';

const collectIndoorEntrances = (args: CollectArgs): Set<number> => {
  const { primaryScreenIndex, allEntrances, fallHoleEntIds, overworldDoorEntIds } = args;
  const currentRespawnIds = new Set<number>();

  for (const entrance of roomEntrances(primaryScreenIndex)) {
    if (entrance.id < STAIR_ID_BASE) {
      if (fallHoleEntIds.has(entrance.id)) continue;
      if (!overworldDoorEntIds.has(entrance.id)) currentRespawnIds.add(entrance.id);
    }
    const existing = allEntrances.findIndex((e) => e.id === entrance.id);
    if (existing !== -1) allEntrances[existing] = entrance;
    else allEntrances.push(entrance);
  }

  const rooms = wasmGetEntranceRooms();
  if (rooms) {
    for (let i = allEntrances.length - 1; i >= 0; i--) {
      const e = allEntrances[i];
      if (e.id >= FALL_HOLE_ENTRANCE_ID_FROM) continue;
      if (rooms[e.id] === primaryScreenIndex) continue;
      if (overworldDoorEntIds.has(e.id)) allEntrances.splice(i, 1);
    }
  }

  return currentRespawnIds;
};

export { collectIndoorEntrances };
