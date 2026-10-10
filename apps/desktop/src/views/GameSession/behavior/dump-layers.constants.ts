/* @layer renderer-appshell @kind constants */
const GRID_DIM = 64;

const NEIGHBOUR_STEPS: readonly (readonly [number, number])[] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

const FLOOD_BUTTON_TIMEOUT_MS = 5000;
const TILE_INSPECTOR_TIMEOUT_MS = 20000;
const DEBUG_HOOK_TICK_MS = 200;
const TOOLTIP_RENDER_MS = 500;

const UNNORMALIZED_ATTR = 0x1C;

export {
  DEBUG_HOOK_TICK_MS, FLOOD_BUTTON_TIMEOUT_MS, GRID_DIM, NEIGHBOUR_STEPS, TILE_INSPECTOR_TIMEOUT_MS, TOOLTIP_RENDER_MS,
  UNNORMALIZED_ATTR,
};
