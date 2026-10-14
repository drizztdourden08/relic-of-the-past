/* @layer renderer-hud @kind logic */
import { brightness, flashOn, phaseOf } from '@rotp/game-data';
import type { TitleFrameInput } from './choreography.type';
import { drawGlints } from './draw-glints';
import { drawBrightness, drawFlash } from './draw-marks';
import { drawPictures } from './draw-pictures';
import { drawScenery } from './draw-scenery';

const drawTitleFrame = (ctx: CanvasRenderingContext2D, input: TitleFrameInput): void => {
  const { frame, scene, dimFlashes, coreTitleHidden } = input;
  const { width, height, frameX, frameY } = scene.geometry;
  const at = { x: frameX, y: frameY };
  ctx.imageSmoothingEnabled = false;
  if (phaseOf(frame) === 'gone' || !coreTitleHidden) {
    ctx.clearRect(0, 0, width, height);
    return;
  }
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  drawScenery(ctx, input);
  drawPictures(ctx, input, at);
  drawGlints(ctx, input, at);
  if (flashOn(frame)) drawFlash(ctx, dimFlashes, width, height);
  drawBrightness(ctx, brightness(frame), width, height);
};

export { drawTitleFrame };
