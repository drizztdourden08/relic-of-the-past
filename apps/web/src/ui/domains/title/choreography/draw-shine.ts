/* @layer renderer-hud @kind logic */
/**
 * The shine that keeps playing on the finished title: one sparkle that grows and shrinks over six
 * four-frame steps, rests dark for eight, then moves to the next of four spots on the logo's letters
 * and the sword's hilt, all on the intro's own frame counter (AnimateSceneSprite_Sparkle).
 */
import type { TitleFrame } from '@shared/game/title/title-frame.type';
import { drawStar } from './draw-sword';

/** The four spots, top-left of the 8x8 frames (kIntroSprite3_X / Y); the spot changes every 32 frames. */
const SPOTS = [{ x: 0xc2, y: 0x7c }, { x: 0x98, y: 0x54 }, { x: 0x6f, y: 0x7c }, { x: 0x34, y: 0x57 }] as const;
/** The picture per four-frame step of the cycle (kIntroSprite3_State); -1 is dark. */
const STEPS: readonly number[] = [0, 1, 2, 3, 2, 1, -1, -1];
/** Star radius per picture: a dot, a small star, and two large ones. */
const RADIUS: readonly number[] = [1, 3, 6, 7];
const HALF = 4;

const drawShine = (ctx: CanvasRenderingContext2D, frame: TitleFrame, alpha: number, frameX: number, frameY: number): void => {
  if (alpha <= 0) return;
  const picture = STEPS[(frame.frameCtr >> 2) & 7];
  if (picture < 0) return;
  const spot = SPOTS[(frame.frameCtr >> 5) & 3];
  ctx.globalAlpha = alpha;
  drawStar(ctx, frameX + spot.x + HALF, frameY + spot.y + HALF, RADIUS[picture], picture === 3);
  ctx.globalAlpha = 1;
};

export { drawShine };
