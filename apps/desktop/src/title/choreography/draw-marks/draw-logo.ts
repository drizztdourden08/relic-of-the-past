/* @layer renderer-hud @kind logic */
import { LOGO_AT } from '@rotp/game-data';
import type { FrameOrigin, Picture } from '../choreography.type';

const drawLogo = (ctx: CanvasRenderingContext2D, { img, scale }: Picture, alpha: number, at: FrameOrigin): void => {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, at.x + LOGO_AT.x, at.y + LOGO_AT.y, img.width / scale, img.height / scale);
  ctx.globalAlpha = 1;
};

export { drawLogo };
