/* @layer renderer-widgets @kind logic */
import { itemAt } from '@app/checked-access';
import { FALL_HOLE_ENTRANCE_ID_FROM } from './nav-flood.constants';
import type { Entrance } from './nav-flood.type';

const pruneForeignDoorEntrances = (
  allEntrances: Entrance[], rooms: Uint16Array, primaryScreenIndex: number, overworldDoorEntIds: Set<number>,
): void => {
  for (let i = allEntrances.length - 1; i >= 0; i--) {
    const e = itemAt(allEntrances, i);
    if (e.id >= FALL_HOLE_ENTRANCE_ID_FROM) continue;
    if (rooms[e.id] === primaryScreenIndex) continue;
    if (overworldDoorEntIds.has(e.id)) allEntrances.splice(i, 1);
  }
};

export { pruneForeignDoorEntrances };
