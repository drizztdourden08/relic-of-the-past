/* @layer shared-input @kind logic */
import type { TouchButton } from '@rotp/features';
import type { ScreenBox } from '../touch-logic.type';
import { basePx } from './base-px';
import { PILL_HALF_HEIGHT, PILL_HALF_WIDTH } from './button-hit-box.constants';
import type { ButtonHitBox } from './button-hit-box.type';
import { toPx } from './to-px';

const buttonHitBox = (button: TouchButton, box: ScreenBox): ButtonHitBox => {
  const size = basePx(box) * button.scale;
  const center = toPx(button.at, box);
  if (button.shape === 'round') {
    return { center, halfW: size / 2, halfH: size / 2, round: true };
  }
  return { center, halfW: PILL_HALF_WIDTH * size, halfH: PILL_HALF_HEIGHT * size, round: false };
};

export { buttonHitBox };
