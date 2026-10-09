/* @layer shared-types @kind constants */
import type { SnesButton } from './snes.type';

const SNES_BUTTONS = [
  'A', 'B', 'X', 'Y', 'L', 'R',
  'Start', 'Select',
  'Up', 'Down', 'Left', 'Right',
] as const;

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
