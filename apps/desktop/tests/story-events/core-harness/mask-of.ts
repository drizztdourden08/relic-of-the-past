/* @layer test @kind helper */
import { SNES_BUTTON_BITS } from '@rotp/game-data';
import type { Button } from './core-harness.type';

const maskOf = (hold: readonly Button[]): number =>
  hold.reduce((mask, button) => mask | (1 << SNES_BUTTON_BITS[button]), 0);

export { maskOf };
