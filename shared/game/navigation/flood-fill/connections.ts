/* @layer shared-game @kind logic */
import type { BorderEdge, ConnectionInfo, FloodFillResult } from '../types';
import { GRID_SIZE } from '../types';
import { getAdjacentScreen } from '../core/get-adjacent-screen';
import { contiguousRuns } from './contiguous-runs';
import { getAdjacentRoom } from './get-adjacent-room';
import { BORDER_EDGES, OPPOSITE_EDGE, SCROLL_SEAM } from './flood-fill.constants';

const seamCrossings = (result: FloodFillResult, edge: BorderEdge): ConnectionInfo[] => {
  const { reachable } = result;
  const positions: number[] = [];
  if (edge === 'south' || edge === 'north') {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (reachable[SCROLL_SEAM.before]?.[col] && reachable[SCROLL_SEAM.after]?.[col]) positions.push(col);
    }
  } else {
    for (let row = 0; row < GRID_SIZE; row++) {
      if (reachable[row]?.[SCROLL_SEAM.before] && reachable[row]?.[SCROLL_SEAM.after]) positions.push(row);
    }
  }
  return contiguousRuns(positions).map((run) => ({
    edge,
    targetScreen: result.screenIndex,
    isIntraRoom: true,
    freeTileCount: run.length,
    itemTileCount: 0,
    positions: run,
    requirements: [],
  }));
};

const borderCrossings = (result: FloodFillResult, edge: BorderEdge): ConnectionInfo[] => {
  const border = result.borders[edge];
  if (border.freeTiles.length + border.itemTiles.length === 0) return [];

  const targetScreen = result.indoors
    ? getAdjacentRoom(result.screenIndex, edge)
    : getAdjacentScreen(result.screenIndex, edge);
  if (targetScreen === null) return [];

  const allPositions = [...border.freeTiles, ...border.itemTiles.map(t => t.pos)].sort((a, b) => a - b);
  const allReqs = new Set<string>();
  for (const t of border.itemTiles) t.requirements.forEach(r => allReqs.add(r));
  const itemPosSet = new Set(border.itemTiles.map(t => t.pos));

  return contiguousRuns(allPositions).map((run) => {
    const freeTileCount = run.filter(p => !itemPosSet.has(p)).length;
    return {
      edge,
      targetScreen,
      freeTileCount,
      itemTileCount: run.length - freeTileCount,
      positions: run,
      requirements: [...allReqs],
    };
  });
};

const getConnections = (result: FloodFillResult, intraEdges?: BorderEdge[]): ConnectionInfo[] => {
  const intraSet = new Set(intraEdges ?? []);
  for (const e of intraEdges ?? []) intraSet.add(OPPOSITE_EDGE[e]);

  return BORDER_EDGES.flatMap((edge) => (intraSet.has(edge) ? seamCrossings(result, edge) : borderCrossings(result, edge)));
};

export { getConnections };
