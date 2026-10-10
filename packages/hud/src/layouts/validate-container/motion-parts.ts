/* @layer shared-hud @kind logic */
import { validateAnimations, validateTransition } from '../validate-motion';
import { validateStyle } from '../validate-style';
import type { HudFlexContainer } from '../../types/hud-node';
import type { Issues } from '../validate-box';

const motionParts = (
  value: Record<string, unknown>, path: string, issues: Issues, insideRepeat: boolean,
): Pick<HudFlexContainer, 'style' | 'animation' | 'transition'> => {
  const style = validateStyle(value.style, `${path}.style`, issues, insideRepeat);
  const animation = validateAnimations(value.animation, `${path}.animation`, issues, insideRepeat);
  const transition = validateTransition(value.transition, `${path}.transition`, issues, insideRepeat);
  return {
    ...(style ? { style } : {}),
    ...(animation ? { animation } : {}),
    ...(transition ? { transition } : {}),
  };
};

export { motionParts };
