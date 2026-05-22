import type { GridPos } from '../types';

/**
 * Reconstruct a path from a parent map (BFS/Dijkstra/A* backtracking).
 * Returns positions from start to end inclusive.
 */
export function reconstructPath(
  parentMap: Map<string, GridPos | null>,
  start: GridPos,
  end: GridPos,
): GridPos[] {
  const path: GridPos[] = [];
  let current: GridPos | null | undefined = end;
  const startKey = `${start.row},${start.col}`;

  while (current) {
    path.unshift(current);
    const key: string = `${current.row},${current.col}`;
    if (key === startKey) break;
    current = parentMap.get(key) ?? null;
  }

  return path;
}

/**
 * Reconstruct a path from a parent map keyed by string IDs (for graph navigation).
 */
export function reconstructIdPath<T>(
  parentMap: Map<string, { from: string; data: T } | null>,
  startId: string,
  endId: string,
): { id: string; data: T | null }[] {
  const path: { id: string; data: T | null }[] = [];
  let current = endId;

  while (current !== startId) {
    const entry = parentMap.get(current);
    if (!entry) break;
    path.unshift({ id: current, data: entry.data });
    current = entry.from;
  }
  path.unshift({ id: startId, data: null });

  return path;
}
