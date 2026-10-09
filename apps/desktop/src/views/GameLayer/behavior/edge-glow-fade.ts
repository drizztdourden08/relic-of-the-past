/* @layer renderer-components @kind logic */
import type { ViewportInfo } from '../../../game';
import { FADE_IN_PER_SECOND, FADE_OUT_PER_SECOND, SCREEN_CROSSING_JUMP_PX } from './useEdgeGlowLoop.constants';
import type { FadeState } from './useEdgeGlowLoop.type';

const boundsJumped = (fade: FadeState, vp: ViewportInfo): boolean =>
  Math.abs(vp.blackLeft - fade.prevBlackLeft) > SCREEN_CROSSING_JUMP_PX
  || Math.abs(vp.blackRight - fade.prevBlackRight) > SCREEN_CROSSING_JUMP_PX
  || Math.abs(vp.blackBottom - fade.prevBlackBottom) > SCREEN_CROSSING_JUMP_PX
  || Math.abs(vp.blackTop - fade.prevBlackTop) > SCREEN_CROSSING_JUMP_PX;

const trackOverworldCrossing = (fade: FadeState, vp: ViewportInfo, hasExtended: boolean): void => {
  const boundsMoved = fade.prevBlackLeft >= 0 && boundsJumped(fade, vp);
  if (boundsMoved) fade.fadeTarget = 0;
  fade.prevBlackLeft = vp.blackLeft;
  fade.prevBlackRight = vp.blackRight;
  fade.prevBlackBottom = vp.blackBottom;
  fade.prevBlackTop = vp.blackTop;
  const settledOnNewScreen = hasExtended && fade.fadeTarget === 0 && !boundsMoved;
  if (settledOnNewScreen) fade.fadeTarget = 1.0;
};

const stepFadeOpacity = (fade: FadeState, dt: number): void => {
  if (fade.fadeOpacity < fade.fadeTarget) {
    fade.fadeOpacity = Math.min(fade.fadeOpacity + dt * FADE_IN_PER_SECOND, fade.fadeTarget);
  } else if (fade.fadeOpacity > fade.fadeTarget) {
    fade.fadeOpacity = Math.max(fade.fadeOpacity - dt * FADE_OUT_PER_SECOND, fade.fadeTarget);
  }
};

const edgeGlowFade = { trackOverworldCrossing, stepFadeOpacity };

export { edgeGlowFade };
