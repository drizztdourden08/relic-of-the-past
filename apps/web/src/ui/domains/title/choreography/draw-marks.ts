/* @layer renderer-hud @kind logic */
/**
 * The still pieces of the choreography: the logo at its place with the fade the core counts, the
 * clang flash over the whole picture, the opening mark in the frames the boot fade covers, and the
 * brightness the boot and the story fade drive.
 */
import { FRAME_H, FRAME_W, LOGO_AT, LOGO_BARS_OVER_BLADE } from '@shared/game/title/title-layout';
import type { Picture } from './draw-title-frame';

const FLASH_ALPHA = 0.55;
const DIM_FLASH_ALPHA = 0.18;
const MARK_SIZE = 64;
const MARK_Y = 84;

const drawLogo = (ctx: CanvasRenderingContext2D, { img, scale }: Picture, alpha: number, frameX: number, frameY: number): void => {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, frameX + LOGO_AT.x, frameY + LOGO_AT.y, img.width / scale, img.height / scale);
  ctx.globalAlpha = 1;
};

/** The two bars of the first letter again, over the blade, so the sword threads through the letter. */
const drawLogoOverBlade = (ctx: CanvasRenderingContext2D, { img, scale }: Picture, alpha: number, frameX: number, frameY: number): void => {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  for (const bar of LOGO_BARS_OVER_BLADE) {
    ctx.drawImage(img, bar.x * scale, bar.y * scale, bar.w * scale, bar.h * scale, frameX + LOGO_AT.x + bar.x, frameY + LOGO_AT.y + bar.y, bar.w, bar.h);
  }
  ctx.globalAlpha = 1;
};

const drawFlash = (ctx: CanvasRenderingContext2D, dim: boolean, width: number, height: number): void => {
  ctx.fillStyle = `rgba(255, 255, 255, ${dim ? DIM_FLASH_ALPHA : FLASH_ALPHA})`;
  ctx.fillRect(0, 0, width, height);
};

const drawOpeningMark = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, frameX: number, frameY: number): void => {
  ctx.drawImage(img, frameX + (FRAME_W - MARK_SIZE) / 2, frameY + MARK_Y, MARK_SIZE, MARK_SIZE);
};

/** Darkens the whole picture to the brightness the core asks for, 1 leaving it as drawn. */
const drawBrightness = (ctx: CanvasRenderingContext2D, brightness: number, width: number, height: number): void => {
  if (brightness >= 1) return;
  ctx.fillStyle = `rgba(0, 0, 0, ${1 - brightness})`;
  ctx.fillRect(0, 0, width, height);
};

export { FRAME_H, drawBrightness, drawFlash, drawLogo, drawLogoOverBlade, drawOpeningMark };
