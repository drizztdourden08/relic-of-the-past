/* @layer shared-game @kind constants */
import type { BorderEdge } from '@rotp/game-core';

const EDGE_TO_DIR: Record<BorderEdge, 'n' | 's' | 'e' | 'w'> = {
  north: 'n', south: 's', east: 'e', west: 'w',
};

export { EDGE_TO_DIR };
