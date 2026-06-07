/* @layer shared-types @kind types */
// ── SNES Buttons ──

const SNES_BUTTONS = [
  'A', 'B', 'X', 'Y', 'L', 'R',
  'Start', 'Select',
  'Up', 'Down', 'Left', 'Right',
] as const;

type SnesButton = (typeof SNES_BUTTONS)[number];

/** Bitmask positions matching emscripten_main.c g_input1_state */
const SNES_BUTTON_BITS: Record<SnesButton, number> = {
  B:      0,
  Y:      1,
  Select: 2,
  Start:  3,
  Up:     4,
  Down:   5,
  Left:   6,
  Right:  7,
  A:      8,
  X:      9,
  L:      10,
  R:      11,
};

/** Human-readable SNES button names (Nintendo layout) */
const SNES_BUTTON_LABELS: Record<SnesButton, string> = {
  A: 'A Button',
  B: 'B Button',
  X: 'X Button',
  Y: 'Y Button',
  L: 'L Bumper',
  R: 'R Bumper',
  Start: 'Start',
  Select: 'Select',
  Up: 'D-Pad Up',
  Down: 'D-Pad Down',
  Left: 'D-Pad Left',
  Right: 'D-Pad Right',
};

/** Game action labels — what each SNES button does in ALttP */
const SNES_ACTION_LABELS: Record<SnesButton, string> = {
  A: 'Interact',
  B: 'Sword',
  X: 'Map',
  Y: 'Item Use',
  L: 'Prev Item',
  R: 'Next Item',
  Start: 'Pause',
  Select: 'Select',
  Up: 'Move Up',
  Down: 'Move Down',
  Left: 'Move Left',
  Right: 'Move Right',
};

export { SNES_BUTTONS, SNES_BUTTON_BITS, SNES_BUTTON_LABELS, SNES_ACTION_LABELS };
export type { SnesButton };
