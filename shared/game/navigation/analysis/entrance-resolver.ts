/* @layer shared-game @kind data */
/**
 * Maps WASM entrance tables to connection points.
 *
 * Uses WASM entrance positions + exit screen map to identify which
 * ConnectionPointData corresponds to which game entrance ID.
 *
 * Input: WASM entrance data (wasmGetOverworldEntrances, wasmGetExitScreenMap)
 * Output: ConnectionPointData[] for each screen
 */

import type { ConnectionPointData } from '../nav-data.types';
import type { OverworldEntrance } from '../types';
import { GRID_SIZE } from '../types';

interface EntranceResolverInput {
  entrances: OverworldEntrance[];
  exitScreenByRoom: Map<number, number>;
  entranceRooms: Uint16Array;
}

interface ResolvedEntrance {
  screenIndex: number;
  entranceId: number;
  point: ConnectionPointData;
}

const resolveEntrances = (input: EntranceResolverInput): ResolvedEntrance[] => {
  const { entrances, exitScreenByRoom } = input;
  const results: ResolvedEntrance[] = [];

  for (const ent of entrances) {
    const screenIndex = ent.area;
    const row = Math.min(ent.gridRow, GRID_SIZE - 1);
    const col = Math.min(ent.gridCol, GRID_SIZE - 1);

    // Determine world prefix from screen index
    const world = screenIndex >= 0x40 ? 'dw' : 'lw';
    const screenHex = screenIndex.toString(16).padStart(2, '0');
    const id = `${world}-${screenHex}-door-${ent.id}`;

    // Determine exit screen for this entrance (which overworld screen the exit returns to)
    const exitScreen = exitScreenByRoom.get(ent.roomId);

    const point: ConnectionPointData = {
      id,
      tiles: [], // Doors don't have border tile arrays
      requirements: [], // No tile-level requirements to reach the door itself
      position: { row, col },
      entranceIndex: ent.id,
      oneWay: null, // Most entrances are bidirectional
    };

    // If exit screen differs from the entrance's area, it's a passage (one-way enter here)
    if (exitScreen !== undefined && exitScreen !== screenIndex) {
      point.oneWay = 'enter';
    }

    results.push({ screenIndex, entranceId: ent.id, point });
  }

  return results;
};

export { resolveEntrances };
export type { EntranceResolverInput, ResolvedEntrance };
