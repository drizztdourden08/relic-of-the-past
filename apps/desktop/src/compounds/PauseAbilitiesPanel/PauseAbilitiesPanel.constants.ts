/* @layer renderer-hud @kind constants */
const INNER_COLS = 17;
const INNER_ROWS = 7;

const ABILITY_GRID: readonly { label: string; bit: number }[] = [
  { label: 'LIFT', bit: 7 },
  { label: 'READ', bit: 6 },
  { label: 'TALK', bit: 5 },
  { label: 'PULL', bit: 3 },
  { label: 'RUN', bit: 2 },
  { label: 'SWIM', bit: 1 },
];

export { ABILITY_GRID, INNER_COLS, INNER_ROWS };
