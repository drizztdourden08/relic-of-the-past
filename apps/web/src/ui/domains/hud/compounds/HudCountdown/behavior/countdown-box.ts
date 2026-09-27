/* @layer renderer-hud @kind logic */
import { DISC_INSET_RATIO } from '../../../primitives/HudPie';
import { DISC_INSET, GRID_SIZE } from '../../../primitives/HudPixelPie';
import type { CountdownBox, HudCountdownVariant } from '../HudCountdown.type';
import { countdownSize } from './countdown-size';

/**
 * Rendered size of the pie box for a variant, and the empty rim between its edge and the disc.
 * The pixel pie measures both in whole game pixels, so its box lands on the game's pixel grid.
 */
const countdownBox = (variant: HudCountdownVariant, scale: number): CountdownBox => {
  if (variant === 'pixel') return { size: GRID_SIZE * scale, rim: DISC_INSET * scale };
  const size = countdownSize(scale);
  return { size, rim: size * DISC_INSET_RATIO };
};

export { countdownBox };
