/* @layer renderer-hud @kind constants */
const GRID_SIZE = 44;
const MAX_PUSH = 4;
const RING_WIDTH = 2;
const HUB_RADIUS = 10;
const RIM_WIDTH = 2;
const DISC_INSET = MAX_PUSH;

const INK = { clear: 0, outline: 1, backing: 2, deep: 3, shade: 4, lit: 5, bright: 6 } as const;
const PULSE_LEVELS: readonly number[] = [INK.bright, INK.lit, INK.shade, INK.lit];

const EXIT_STEPS = 4;
const STEP_MS = 125;
const PULSE_STEP_TICKS = 4;

const DITHER: readonly (readonly number[])[] = [[0, 2], [3, 1]];

const INK_PROPERTIES: Record<number, string> = {
  [INK.outline]: '--hud-pixel-pie-outline',
  [INK.backing]: '--hud-pixel-pie-backing',
  [INK.deep]: '--hud-pixel-pie-deep',
  [INK.shade]: '--hud-pixel-pie-shade',
  [INK.lit]: '--hud-pixel-pie-lit',
  [INK.bright]: '--hud-pixel-pie-bright',
};

const FULL_TURN = Math.PI * 2;
const GAP_HALF = 0.5;

export {
  GRID_SIZE, MAX_PUSH, RING_WIDTH, HUB_RADIUS, RIM_WIDTH, DISC_INSET,
  INK, PULSE_LEVELS, EXIT_STEPS, STEP_MS, PULSE_STEP_TICKS, DITHER,
  INK_PROPERTIES, FULL_TURN, GAP_HALF,
};
