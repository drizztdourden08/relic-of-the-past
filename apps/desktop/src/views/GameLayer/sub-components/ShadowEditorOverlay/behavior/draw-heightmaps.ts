/* @layer renderer-components @kind logic */
import { drawHeightmap } from './draw-heightmap';
import type { OverlayView, ScreenData } from './overlay.type';

const drawHeightmaps = (ctx: CanvasRenderingContext2D, view: OverlayView, screenData: ScreenData, selectedElementId: string | null): void => {
  ctx.globalAlpha = 0.5;
  for (const el of screenData.heightmap) {
    drawHeightmap(ctx, view, el, el.id === selectedElementId);
  }
};

export { drawHeightmaps };
