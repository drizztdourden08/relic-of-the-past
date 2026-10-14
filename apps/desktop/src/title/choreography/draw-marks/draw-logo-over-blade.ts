/* @layer renderer-hud @kind logic */
import { LOGO_AT, LOGO_BARS_OVER_BLADE } from '@rotp/game-data';
import type { FrameOrigin, Picture } from '../choreography.type';

const drawLogoOverBlade = (ctx: CanvasRenderingContext2D, { img, scale }: Picture, alpha: number, at: FrameOrigin): void => {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  for (const bar of LOGO_BARS_OVER_BLADE) {
    ctx.drawImage(img, bar.x * scale, bar.y * scale, bar.w * scale, bar.h * scale, at.x + LOGO_AT.x + bar.x, at.y + LOGO_AT.y + bar.y, bar.w, bar.h);
  }
  ctx.globalAlpha = 1;
};

export { drawLogoOverBlade };
