/* @layer shared-game @kind constants */
import type { BorderEdge } from '@rotp/game-core';

const LAYER_LOCKED_STAIRCASE = 2;

const LEDGE_RESEED_PASSES = 4;

const SCROLL_SEAM = { before: 31, after: 32 } as const;

const ROOM_GRID = { cols: 16, rows: 20 } as const;

const BORDER_EDGES: readonly BorderEdge[] = ['north', 'south', 'east', 'west'];

const OPPOSITE_EDGE: Record<BorderEdge, BorderEdge> = { north: 'south', south: 'north', east: 'west', west: 'east' };

export { BORDER_EDGES, LAYER_LOCKED_STAIRCASE, LEDGE_RESEED_PASSES, OPPOSITE_EDGE, ROOM_GRID, SCROLL_SEAM };
