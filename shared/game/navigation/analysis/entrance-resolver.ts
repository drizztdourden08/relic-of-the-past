/* @layer shared-game @kind logic */
import type { ConnectionPointData } from '@rotp/game-data';
import type { EntranceResolverInput, ResolvedEntrance } from './entrance-resolver.type';
import { GRID_SIZE } from '../types';
import { DARK_WORLD_FLAG } from './analysis.constants';

const resolveEntrances = (input: EntranceResolverInput): ResolvedEntrance[] => {
  const { entrances, exitScreenByRoom } = input;
  const results: ResolvedEntrance[] = [];

  for (const ent of entrances) {
    const screenIndex = ent.area;
    const row = Math.min(ent.gridRow, GRID_SIZE - 1);
    const col = Math.min(ent.gridCol, GRID_SIZE - 1);

    const world = screenIndex >= DARK_WORLD_FLAG ? 'dw' : 'lw';
    const screenHex = screenIndex.toString(16).padStart(2, '0');
    const exitScreen = exitScreenByRoom.get(ent.roomId);
    const isPassage = exitScreen !== undefined && exitScreen !== screenIndex;

    const point: ConnectionPointData = {
      id: `${world}-${screenHex}-door-${ent.id}`,
      tiles: [],
      requirements: [],
      position: { row, col },
      entranceIndex: ent.id,
      oneWay: isPassage ? 'enter' : null,
    };

    results.push({ screenIndex, entranceId: ent.id, point });
  }

  return results;
};

export { resolveEntrances };
export type { EntranceResolverInput, ResolvedEntrance } from './entrance-resolver.type';
