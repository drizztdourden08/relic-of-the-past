/* @layer renderer-widgets @kind logic */
/**
 * Merges the canonical indoor entrance list into the widget's seed array and
 * reports which of them are respawn points.
 *
 * This used to build its own list — spawn tiles, exit-door refinement, stairs and
 * walk boundaries — in parallel with the simulator's. The list itself now comes
 * from `roomEntrances`; what remains here is the two things only the widget needs:
 * replacing overworld entries whose grid coords belong to a different screen, and
 * telling the UI which ids are respawn points.
 */
import { wasmGetEntranceRooms } from '../../../../../lib/game';
import { roomEntrances, STAIR_ID_BASE } from '../../../../../lib/game/flood';
import type { enrichEntrances } from '@app/lib/game/flood/overworld-entrances';

type Entrance = ReturnType<typeof enrichEntrances>[number];

interface CollectArgs {
  primaryScreenIndex: number;
  allEntrances: Entrance[];
  exitScreenByRoom: Map<number, number>;
  fallHoleEntIds: Set<number>;
  overworldDoorEntIds: Set<number>;
}

const collectIndoorEntrances = (args: CollectArgs): Set<number> => {
  const { primaryScreenIndex, allEntrances, fallHoleEntIds, overworldDoorEntIds } = args;
  const currentRespawnIds = new Set<number>();

  for (const entrance of roomEntrances(primaryScreenIndex)) {
    // Fall-hole landings are drawn separately; real entrances that are not an
    // overworld door are the room's respawn points.
    if (entrance.id < STAIR_ID_BASE) {
      if (fallHoleEntIds.has(entrance.id)) continue;
      if (!overworldDoorEntIds.has(entrance.id)) currentRespawnIds.add(entrance.id);
    }
    // The overworld pass may already hold this id with OUTDOOR grid coords —
    // replace it, don't add a second marker on the wrong tile.
    const existing = allEntrances.findIndex((e) => e.id === entrance.id);
    if (existing !== -1) allEntrances[existing] = entrance;
    else allEntrances.push(entrance);
  }

  // Overworld screen ids overlap indoor room ids (OW 0x51 vs room 0x51), so an
  // unrelated overworld entrance can leak in. Drop the ones that don't target
  // this room; fall holes (200+) and synthetic stair/boundary ids are exempt.
  const rooms = wasmGetEntranceRooms();
  if (rooms) {
    for (let i = allEntrances.length - 1; i >= 0; i--) {
      const e = allEntrances[i];
      if (e.id >= 200) continue;
      if (rooms[e.id] === primaryScreenIndex) continue;
      if (overworldDoorEntIds.has(e.id)) allEntrances.splice(i, 1);
    }
  }

  return currentRespawnIds;
};

export { collectIndoorEntrances };
