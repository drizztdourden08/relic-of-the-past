/* @layer renderer-hud @kind logic */
import { LOGO_AT } from '@shared/game/title/title-layout';
import type { Picture } from '../choreography.type';

const drawLogo = (ctx: CanvasRenderingContext2D, { img, scale }: Picture, alpha: number, frameX: number, frameY: number): void => {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, frameX + LOGO_AT.x, frameY + LOGO_AT.y, img.width / scale, img.height / scale);
  ctx.globalAlpha = 1;
};

export { drawLogo };
