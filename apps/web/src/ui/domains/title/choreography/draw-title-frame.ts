/* @layer renderer-hud @kind logic */
/**
 * One frame of the title, in the order the original layers it: black, the scene fading in behind,
 * the triangles, the logo fading in, the sword with its sparkle, the flash, then the brightness.
 */
import type { TitleFrame } from '@shared/game/title/title-frame.type';
import { brightness, flashOn, logoAlpha, phaseOf, sceneAlpha, swordShown, triforceShown } from '@shared/game/title/title-phase';
import type { Scene } from '../scene/compose-scene';
import type { SceneClock } from '../scene/scene.type';
import { drawSword } from './draw-sword';
import { drawShine } from './draw-shine';
import { drawTriforce, type TriforcePicture } from './draw-triforce';
import { drawBrightness, drawFlash, drawLogo, drawLogoOverBlade, drawOpeningMark } from './draw-marks';

/** A picture and the factor it was stored at: the ROM's extracted set is written at 2x. */
interface Picture {
  img: HTMLImageElement;
  scale: number;
}

interface TitlePictures {
  logo: Picture;
  sword: Picture;
  openingMark: HTMLImageElement;
}

interface TitleFrameInput {
  frame: TitleFrame;
  clock: SceneClock;
  scene: Scene;
  sceneCanvas: HTMLCanvasElement;
  pictures: TitlePictures;
  triforce: TriforcePicture;
  poly: Uint8Array | null;
  palette: number[] | null;
  dimFlashes: boolean;
  /** Whether the core is keeping its own title off the picture this frame. */
  hidden: boolean;
}

const drawTitleFrame = (ctx: CanvasRenderingContext2D, input: TitleFrameInput): void => {
  const { frame, clock, scene, sceneCanvas, pictures, triforce, poly, palette, dimFlashes, hidden } = input;
  const { width, height, frameX, frameY } = scene.geometry;
  const phase = phaseOf(frame);
  ctx.imageSmoothingEnabled = false;
  // Once the core draws the picture itself again (the file select, the story), nothing may cover it.
  if (phase === 'gone' || !hidden) {
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
  // The recurring sparkle exists from the logo fade on and plays over the letters and the hilt.
  if (frame.submodule >= 5 || frame.module !== 0) drawShine(ctx, frame, logoAlpha(frame), frameX, frameY);
  if (flashOn(frame)) drawFlash(ctx, dimFlashes, width, height);
  drawBrightness(ctx, brightness(frame), width, height);
};

export { drawTitleFrame };
export type { Picture, TitleFrameInput, TitlePictures };
