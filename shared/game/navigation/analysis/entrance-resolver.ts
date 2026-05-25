/**
 * Entrance Resolver — maps entrance tiles found during flood fill
 * to their destination rooms via the ROM's entrance table.
 */

import type { RomData } from '../../../asset-extraction/rom/rom-types';
import type { OverworldEntrance } from '../types';
import type { ConnectionPointData } from '../plan/navigation-data.types';

export interface ResolvedEntrance {
  /** Overworld screen where the entrance is */
  screen: number;
  /** Grid position of the entrance tile */
  position: { row: number; col: number };
  /** Game's entrance index */
  entranceIndex: number;
  /** Destination room ID */
  roomId: number;
  /** Connection point data for this entrance */
  connectionPoint: ConnectionPointData;
}

/**
 * Resolve all known entrances for a given screen.
 * Uses the ROM's entrance table to map overworld positions → interior rooms.
 */
export function resolveEntrances(
  rom: RomData,
  screenIndex: number,
  entrances: OverworldEntrance[],
): ResolvedEntrance[] {
  const results: ResolvedEntrance[] = [];
  const screenEntrances = entrances.filter(e => e.area === screenIndex);
  const prefix = `lw-${screenIndex.toString(16).padStart(2, '0')}`;

  for (let i = 0; i < screenEntrances.length; i++) {
    const ent = screenEntrances[i];
    results.push({
      screen: screenIndex,
      position: { row: ent.gridRow, col: ent.gridCol },
      entranceIndex: ent.id,
      roomId: ent.roomId,
      connectionPoint: {
        id: `${prefix}-door-${i}`,
        tiles: [],
        requirements: [],
        position: { row: ent.gridRow, col: ent.gridCol },
        entranceIndex: ent.id,
        oneWay: null,
      },
    });
  }

  return results;
}
