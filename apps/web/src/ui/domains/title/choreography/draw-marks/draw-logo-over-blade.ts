/* @layer renderer-hud @kind logic */
import { LOGO_AT, LOGO_BARS_OVER_BLADE } from '@shared/game/title/title-layout';
import type { Picture } from '../choreography.type';

const drawLogoOverBlade = (ctx: CanvasRenderingContext2D, { img, scale }: Picture, alpha: number, frameX: number, frameY: number): void => {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  for (const bar of LOGO_BARS_OVER_BLADE) {
    ctx.drawImage(img, bar.x * scale, bar.y * scale, bar.w * scale, bar.h * scale, frameX + LOGO_AT.x + bar.x, frameY + LOGO_AT.y + bar.y, bar.w, bar.h);
  }
  ctx.globalAlpha = 1;
};

export { drawLogoOverBlade };
