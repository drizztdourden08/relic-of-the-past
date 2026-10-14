/* @layer renderer-hud @kind logic */
import { sceneAlpha } from '@rotp/game-data';
import type { TitleFrameInput } from './choreography.type';

const drawScenery = (ctx: CanvasRenderingContext2D, input: TitleFrameInput): void => {
  const { frame, clock, scene, sceneCanvas } = input;
  const scenery = sceneAlpha(frame);
  if (scenery <= 0) return;
  const sceneCtx = sceneCanvas.getContext('2d');
  if (!sceneCtx) return;
  scene.draw(sceneCtx, clock);
  ctx.globalAlpha = scenery;
  ctx.drawImage(sceneCanvas, 0, 0);
  ctx.globalAlpha = 1;
};

export { drawScenery };
