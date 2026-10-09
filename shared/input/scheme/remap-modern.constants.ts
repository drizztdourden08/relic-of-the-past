/* @layer shared-input @kind constants */
import { SNES_BUTTON_BITS } from '../../types/controls/snes';

const BIT = {
  A: 1 << SNES_BUTTON_BITS.A,
  B: 1 << SNES_BUTTON_BITS.B,
  X: 1 << SNES_BUTTON_BITS.X,
  Y: 1 << SNES_BUTTON_BITS.Y,
  Start: 1 << SNES_BUTTON_BITS.Start,
} as const;

export { BIT };
