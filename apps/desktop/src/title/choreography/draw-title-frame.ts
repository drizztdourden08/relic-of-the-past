/* @layer renderer-hud @kind logic */
import { brightness, flashOn, logoAlpha, phaseOf, sceneAlpha, swordShown, triforceShown, SWORD_REST_BASE } from '@rotp/game-data';
import type { TitleFrameInput } from './choreography.type';
import { drawSword } from './draw-sword';
import { drawTriforce } from './draw-triforce';
import { drawBrightness, drawFlash, drawLogo, drawLogoOverBlade, drawOpeningMark } from './draw-marks';
import { TITLE_SUBMODULE_LOGO_FADE } from './draw-title-frame.constants';

const drawTitleFrame = (ctx: CanvasRenderingContext2D, input: TitleFrameInput): void => {
  const { frame, clock, scene, sceneCanvas, pictures, triforce, poly, palette, dimFlashes, coreTitleHidden, shine, sweep } = input;
  const { width, height, frameX, frameY } = scene.geometry;
  const phase = phaseOf(frame);
  ctx.imageSmoothingEnabled = false;
  if (phase === 'gone' || !coreTitleHidden) {
    ctx.clearRect(0, 0, width, height);
    return;
  }
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  const scenery = sceneAlpha(frame);
  if (scenery > 0) {
    const sceneCtx = sceneCanvas.getContext('2d');
    if (sceneCtx) {
      scene.draw(sceneCtx, clock);
      ctx.globalAlpha = scenery;
      ctx.drawImage(sceneCanvas, 0, 0);
      ctx.globalAlpha = 1;
    }
  }
  if (phase === 'boot') drawOpeningMark(ctx, pictures.openingMark, frameX, frameY);
  if (triforceShown(frame) && poly && palette) {
    triforce.update(poly, palette);
    drawTriforce(ctx, triforce, frame.pieces, frameX, frameY);
  }
  drawLogo(ctx, pictures.logo, logoAlpha(frame), frameX, frameY);
  if (swordShown(frame)) {
    drawSword(ctx, pictures.sword, frame, frameX, frameY);
    drawLogoOverBlade(ctx, pictures.logo, logoAlpha(frame), frameX, frameY);
  }
  const swordPlanted = swordShown(frame) && frame.swordY === SWORD_REST_BASE;
  const logoFadeStarted = frame.submodule >= TITLE_SUBMODULE_LOGO_FADE || frame.module !== 0;
  if (logoFadeStarted) shine.draw(ctx, clock.t, logoAlpha(frame), frameX, frameY, swordPlanted);
  if (phase === 'idle') sweep.draw(ctx, clock.t, pictures.logo, logoAlpha(frame), frameX, frameY);
  if (flashOn(frame)) drawFlash(ctx, dimFlashes, width, height);
  drawBrightness(ctx, brightness(frame), width, height);
};

export { drawTitleFrame };
