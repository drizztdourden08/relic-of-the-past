/* @layer renderer-hud @kind logic */
import { GLINT_RUN_MAX, GLINT_TOP_OFFSET, GLINT_X, HILT_SPARKLE_AT, SWORD_TOP_FOR_BASE, SWORD_X } from '@rotp/game-data';
import type { TitleFrame } from '@rotp/game-data';
import type { FrameOrigin, Picture } from './choreography.type';
import { drawStar } from './draw-star';
import { STAR_ARM, STAR_CORE } from './draw-star.constants';
import { itemAt } from '@app/checked-access';
import { GLINT_H, HILT_SPARKLE_RADIUS, HILT_SPARKLE_STEPS } from './draw-sword.constants';

const drawSword = (ctx: CanvasRenderingContext2D, { img, scale }: Picture, frame: TitleFrame, at: FrameOrigin): void => {
  const top = at.y + SWORD_TOP_FOR_BASE + frame.swordY;
  ctx.drawImage(img, at.x + SWORD_X, top, img.width / scale, img.height / scale);
  if (frame.sparklePhase === 1 && frame.sparkleIndex < HILT_SPARKLE_STEPS) {
    drawStar(ctx, { x: at.x + HILT_SPARKLE_AT.x + 4, y: at.y + HILT_SPARKLE_AT.y + 4 }, itemAt(HILT_SPARKLE_RADIUS, frame.sparkleIndex));
    return;
  }
  if (frame.sparklePhase === 2 && frame.sparkleIndex < HILT_SPARKLE_STEPS) {
    const y = at.y + Math.min(frame.sparkleRun, GLINT_RUN_MAX) + frame.swordY + GLINT_TOP_OFFSET;
    const x = at.x + GLINT_X + 2;
    ctx.fillStyle = STAR_ARM;
    ctx.fillRect(x + 1, y, 2, GLINT_H);
    ctx.fillStyle = STAR_CORE;
    ctx.fillRect(x + 1, y + 2, 1, GLINT_H - 4);
  }
};

export { drawSword };
