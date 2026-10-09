/* @layer renderer-components @kind logic */
import type { Edges } from '@shared/types/hud';

const compactEdges = (edges: Edges): Edges | undefined =>
  (Object.values(edges).some((n) => n !== undefined) ? edges : undefined);

export { compactEdges };
