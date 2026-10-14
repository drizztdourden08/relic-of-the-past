/* @layer renderer-hud @kind logic */
import { logoAlpha, phaseOf, swordShown, SWORD_REST_BASE } from '@rotp/game-data';
import type { FrameOrigin, TitleFrameInput } from './choreography.type';
import { TITLE_SUBMODULE_LOGO_FADE } from './draw-title-frame.constants';

const drawGlints = (ctx: CanvasRenderingContext2D, input: TitleFrameInput, at: FrameOrigin): void => {
  const { frame, clock, pictures, shine, sweep } = input;
  const swordPlanted = swordShown(frame) && frame.swordY === SWORD_REST_BASE;
  const logoFadeStarted = frame.submodule >= TITLE_SUBMODULE_LOGO_FADE || frame.module !== 0;
  if (logoFadeStarted) shine.draw({ ctx, t: clock.t, alpha: logoAlpha(frame), at, swordPlanted });
  if (phaseOf(frame) === 'idle') sweep.draw({ ctx, t: clock.t, logo: pictures.logo, alpha: logoAlpha(frame), at });
};

export { drawGlints };
