/* @layer renderer-widgets @kind constants */
import type { BorderEdge } from '@rotp/game-core';

const EDGE_COLOR_BY_SIDE: Record<BorderEdge, string> = {
  north: '#4488ff', south: '#44ff88', east: '#ff8844', west: '#bb44ff',
};

const EDGE_COLORS: Record<string, string> = { ...EDGE_COLOR_BY_SIDE, entrance: '#ffcc44' };

const OVERWORLD_SCREENS_PER_WORLD = 64;

const NO_PALACE = 0xFF;

const DEBUG_TICK_MS = 200;
const DEBUG_TICK_WRAP = 1023;

export { DEBUG_TICK_MS, DEBUG_TICK_WRAP, EDGE_COLOR_BY_SIDE, EDGE_COLORS, NO_PALACE, OVERWORLD_SCREENS_PER_WORLD };
