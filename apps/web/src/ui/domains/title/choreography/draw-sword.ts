/* @layer renderer-hud @kind logic */
/**
 * The sword where the intro's ten sprites put it, then the sparkle on its hilt and the glint that
 * runs down the blade, on the frames the core counts (Intro_PeriodicSwordAndIntroFlash).
 */
import { GLINT_RUN_MAX, GLINT_TOP_OFFSET, GLINT_X, HILT_SPARKLE_AT, SWORD_TOP_FOR_BASE, SWORD_X } from '@shared/game/title/title-layout';
import type { TitleFrame } from '@shared/game/title/title-frame.type';
import type { Picture } from './draw-title-frame';

/** The hilt sparkle's seven steps alternate between a small and a large star. */
const SPARKLE_RADIUS = [2, 3, 4, 3, 4, 3, 2] as const;
const SPARKLE_STEPS = 7;
const GLINT_H = 12;
const WHITE = '#ffffff';
const GLOW = 'rgba(255, 255, 220, 0.6)';

/** A four-point star of radius r, with short diagonal points when asked. */
const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, diagonals = false): void => {
  ctx.fillStyle = GLOW;
  ctx.fillRect(cx - r, cy - 1, r * 2 + 1, 3);
  ctx.fillRect(cx - 1, cy - r, 3, r * 2 + 1);
  if (diagonals) {
    const d = Math.max(1, r >> 1);
    for (let i = 1; i <= d; i++) {
      ctx.fillRect(cx - i, cy - i, 1, 1);
      ctx.fillRect(cx + i, cy - i, 1, 1);
      ctx.fillRect(cx - i, cy + i, 1, 1);
      ctx.fillRect(cx + i, cy + i, 1, 1);
    }
  }
  ctx.fillStyle = WHITE;
  ctx.fillRect(cx - r, cy, r * 2 + 1, 1);
  ctx.fillRect(cx, cy - r, 1, r * 2 + 1);
};

const drawSword = (ctx: CanvasRenderingContext2D, { img, scale }: Picture, frame: TitleFrame, frameX: number, frameY: number): void => {
  const top = frameY + SWORD_TOP_FOR_BASE + frame.swordY;
  ctx.drawImage(img, frameX + SWORD_X, top, img.width / scale, img.height / scale);
  if (frame.sparklePhase === 1 && frame.sparkleIndex < SPARKLE_STEPS) {
    drawStar(ctx, frameX + HILT_SPARKLE_AT.x + 4, frameY + HILT_SPARKLE_AT.y + 4, SPARKLE_RADIUS[frame.sparkleIndex]);
    return;
  }
  if (frame.sparklePhase === 2 && frame.sparkleIndex < SPARKLE_STEPS) {
    const y = frameY + Math.min(frame.sparkleRun, GLINT_RUN_MAX) + frame.swordY + GLINT_TOP_OFFSET;
    const x = frameX + GLINT_X + 2;
    ctx.fillStyle = GLOW;
    ctx.fillRect(x, y, 4, GLINT_H);
    ctx.fillStyle = WHITE;
    ctx.fillRect(x + 1, y + 2, 2, GLINT_H - 4);
  }
};

export { drawStar, drawSword };
