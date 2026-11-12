/* @layer shared-input @kind logic */
import type { TouchButton } from '@rotp/features';
import type { PxPoint, ScreenBox } from '../touch-logic.type';
import { basePx } from './base-px';
import { toPx } from './to-px';

interface ButtonHitBox {
  center: PxPoint;
  halfW: number;
  halfH: number;
  round: boolean;
}

const PILL_HALF_WIDTH = 1.1;
const PILL_HALF_HEIGHT = 0.4;

/** A button's touch area in px: a circle for round buttons, a rectangle for pills. */
const buttonHitBox = (button: TouchButton, box: ScreenBox): ButtonHitBox => {
  const size = basePx(box) * button.scale;
  const center = toPx(button.at, box);
  if (button.shape === 'round') {
    return { center, halfW: size / 2, halfH: size / 2, round: true };
  }
  return { center, halfW: PILL_HALF_WIDTH * size, halfH: PILL_HALF_HEIGHT * size, round: false };
};

export type { ButtonHitBox };
export { buttonHitBox };
