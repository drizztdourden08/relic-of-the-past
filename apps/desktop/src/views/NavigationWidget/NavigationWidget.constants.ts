/* @layer renderer-widgets @kind constants */
import type { BorderEdge } from '@rotp/game-core';

const EDGE_COLOR_BY_SIDE: Record<BorderEdge, string> = {
  north: '#4488ff', south: '#44ff88', east: '#ff8844', west: '#bb44ff',
};

const EDGE_COLORS: Record<string, string> = { ...EDGE_COLOR_BY_SIDE, entrance: '#ffcc44' };

const OVERWORLD_SCREENS_PER_WORLD = 64;

export { EDGE_COLOR_BY_SIDE, EDGE_COLORS, OVERWORLD_SCREENS_PER_WORLD };
