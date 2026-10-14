/* @layer renderer-widgets @kind logic */
import { wasmGetEntranceRooms } from '../../game';
import { roomEntrances, STAIR_ID_BASE } from '../../game/flood';
import { pruneForeignDoorEntrances } from './prune-foreign-door-entrances';
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
  if (rooms) pruneForeignDoorEntrances(allEntrances, rooms, primaryScreenIndex, overworldDoorEntIds);

  return currentRespawnIds;
};

export { collectIndoorEntrances };
