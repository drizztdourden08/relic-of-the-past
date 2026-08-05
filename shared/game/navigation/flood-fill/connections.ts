/* @layer shared-game @kind logic */
/** Derive inter-screen / intra-room connections from a flood-fill result. */
import type { FloodFillResult, ConnectionInfo } from '../types';
import { GRID_SIZE } from '../types';
import { getAdjacentScreen } from '../core/grid-utils';

const getAdjacentRoom = (roomIdx: number, edge: 'north' | 'south' | 'east' | 'west'): number | null => {
  const col = roomIdx % 16;
  const row = Math.floor(roomIdx / 16);
  switch (edge) {
    case 'north': return row > 0 ? roomIdx - 16 : null;
    case 'south': return row < 19 ? roomIdx + 16 : null;
    case 'west': return col > 0 ? roomIdx - 1 : null;
    case 'east': return col < 15 ? roomIdx + 1 : null;
  }
};

const getConnections = (result: FloodFillResult, intraEdges?: ('north' | 'south' | 'east' | 'west')[]): ConnectionInfo[] => {
  const connections: ConnectionInfo[] = [];
  const edges: ('north' | 'south' | 'east' | 'west')[] = ['north', 'south', 'east', 'west'];
  const isIndoor = result.indoors;
  const intraSet = new Set(intraEdges ?? []);

  // Expand intra edges to include both sides of each boundary.
  // e.g. 'south' (upper→lower) implies 'north' (lower→upper) for the same boundary.
  const opposites: Record<string, 'north' | 'south' | 'east' | 'west'> = { north: 'south', south: 'north', east: 'west', west: 'east' };
  for (const e of intraEdges ?? []) intraSet.add(opposites[e]);

  for (const edge of edges) {
    const isIntra = intraSet.has(edge);

    if (isIntra) {
      // Intra-room edges: scan the reachable grid at the scroll boundary (row 31↔32 or col 31↔32).
      // BFS doesn't produce transitions here — these are internal crossings.
      const positions: number[] = [];
      const reachable = result.reachable;
      if (edge === 'south' || edge === 'north') {
        // Horizontal boundary at row 31/32
        for (let col = 0; col < GRID_SIZE; col++) {
          if (reachable[31]?.[col] && reachable[32]?.[col]) {
            positions.push(col);
          }
        }
      } else {
        // Vertical boundary at col 31/32
        for (let row = 0; row < GRID_SIZE; row++) {
          if (reachable[row]?.[31] && reachable[row]?.[32]) {
            positions.push(row);
          }
        }
      }
      if (positions.length === 0) continue;

      // Split into contiguous runs
      let bundleStart = 0;
      for (let i = 1; i <= positions.length; i++) {
        if (i === positions.length || positions[i] !== positions[i - 1] + 1) {
          const bundlePositions = positions.slice(bundleStart, i);
          connections.push({
            edge,
            targetScreen: result.screenIndex,
            isIntraRoom: true,
            freeTileCount: bundlePositions.length,
            itemTileCount: 0,
            positions: bundlePositions,
            requirements: [],
          });
          bundleStart = i;
        }
      }
    } else {
      const border = result.borders[edge];
      const totalTiles = border.freeTiles.length + border.itemTiles.length;
      if (totalTiles === 0) continue;

      const targetScreen = isIndoor
        ? getAdjacentRoom(result.screenIndex, edge)
        : getAdjacentScreen(result.screenIndex, edge);
      if (targetScreen === null) continue;

      const allPositions = [...border.freeTiles, ...border.itemTiles.map(t => t.pos)].sort((a, b) => a - b);
      const allReqs = new Set<string>();
      for (const t of border.itemTiles) t.requirements.forEach(r => allReqs.add(r));

      // Split into contiguous runs so blocked gaps produce separate connections
      const itemPosSet = new Set(border.itemTiles.map(t => t.pos));
      let bundleStart = 0;
      for (let i = 1; i <= allPositions.length; i++) {
        if (i === allPositions.length || allPositions[i] !== allPositions[i - 1] + 1) {
          const bundlePositions = allPositions.slice(bundleStart, i);
          const bundleFree = bundlePositions.filter(p => !itemPosSet.has(p)).length;
          const bundleItem = bundlePositions.length - bundleFree;
          connections.push({
            edge,
            targetScreen,
            freeTileCount: bundleFree,
            itemTileCount: bundleItem,
            positions: bundlePositions,
            requirements: [...allReqs],
          });
          bundleStart = i;
        }
      }
    }
  }

  return connections;
};

export { getConnections };
