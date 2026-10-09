/* @layer shared-input @kind constants */
import { SNES_BUTTON_BITS } from '@rotp/game-data';

const X_BIT = 1 << SNES_BUTTON_BITS.X;
const SELECT_BIT = 1 << SNES_BUTTON_BITS.Select;

export { SELECT_BIT, X_BIT };
