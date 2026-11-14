/* @layer shared-input @kind logic */
import type { TouchButton } from '@rotp/features';
import type { ScreenBox } from '../touch-logic.type';
import { basePx } from './base-px';
import type { ButtonHitBox } from './button-hit-box.type';
import { toPx } from './to-px';

const buttonHitBox = (button: TouchButton, box: ScreenBox): ButtonHitBox => {
  const size = basePx(box) * button.scale;
  const halfW = (size * button.width) / 2;
  const halfH = (size * button.height) / 2;
  const round = button.width === button.height && button.radius >= 1;
  return { center: toPx(button.at, box), halfW, halfH, round };
};

export { buttonHitBox };
