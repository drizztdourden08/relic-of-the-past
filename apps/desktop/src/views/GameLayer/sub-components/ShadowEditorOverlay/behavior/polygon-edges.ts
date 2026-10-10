/* @layer renderer-components @kind logic */
import type { Point } from './overlay.type';

const polygonEdges = (pts: readonly Point[]): (readonly [Point, Point])[] => {
  const last = pts.at(-1);
  if (last === undefined) return [];
  const edges: (readonly [Point, Point])[] = [];
  let prev = last;
  for (const point of pts) {
    edges.push([point, prev]);
    prev = point;
  }
  return edges;
};

export { polygonEdges };
