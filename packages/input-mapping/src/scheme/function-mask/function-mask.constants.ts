/* @layer shared-input @kind constants */
import { SNES_BUTTON_BITS } from '@rotp/game-data';
import type { MenuMask } from './function-mask.type';

const DIRECTION_BIT = {
  up: 1 << SNES_BUTTON_BITS.Up,
  down: 1 << SNES_BUTTON_BITS.Down,
  left: 1 << SNES_BUTTON_BITS.Left,
  right: 1 << SNES_BUTTON_BITS.Right,
} as const;

const EMPTY_MENU: MenuMask = { confirm: false, cancel: false, prevScreen: false, nextScreen: false };

export { DIRECTION_BIT, EMPTY_MENU };
