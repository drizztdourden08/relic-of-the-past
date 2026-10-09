/* @layer renderer-components @kind logic */
import { compactEdges } from './compact-edges';
import type { Edges } from '@shared/types/hud';
import type { Offset } from './offset.type';

const withOffset = (margin: Edges | undefined, next: Offset): Edges | undefined => {
  const edges: Edges = { ...margin };
  if (next.x === 0) delete edges.left; else edges.left = next.x;
  if (next.y === 0) delete edges.top; else edges.top = next.y;
  return compactEdges(edges);
};

export { withOffset };
