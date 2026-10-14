/* @layer renderer-hud @kind logic */
import { logoAlpha, phaseOf, swordShown, triforceShown } from '@rotp/game-data';
import type { FrameOrigin, TitleFrameInput } from './choreography.type';
import { drawSword } from './draw-sword';
import { drawTriforce } from './draw-triforce';
import { drawLogo, drawLogoOverBlade, drawOpeningMark } from './draw-marks';

const drawPictures = (ctx: CanvasRenderingContext2D, input: TitleFrameInput, at: FrameOrigin): void => {
  const { frame, pictures, triforce, poly, palette } = input;
  if (phaseOf(frame) === 'boot') drawOpeningMark(ctx, pictures.openingMark, at.x, at.y);
  if (triforceShown(frame) && poly && palette) {
    triforce.update(poly, palette);
    drawTriforce(ctx, triforce, frame.pieces, at);
  }
  drawLogo(ctx, pictures.logo, logoAlpha(frame), at);
  if (swordShown(frame)) {
    drawSword(ctx, pictures.sword, frame, at);
    drawLogoOverBlade(ctx, pictures.logo, logoAlpha(frame), at);
  }
};

export { drawPictures };
