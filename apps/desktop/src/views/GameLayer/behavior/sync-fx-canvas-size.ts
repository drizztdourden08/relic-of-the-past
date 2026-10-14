/* @layer renderer-components @kind logic */
import type { BufferSize } from '../GameLayer.type';

const syncFxCanvasSize = (gameCanvas: HTMLCanvasElement, fxCanvas: HTMLCanvasElement, setBufSize: (s: BufferSize) => void): void => {
  if (gameCanvas.width === fxCanvas.width && gameCanvas.height === fxCanvas.height) return;
  fxCanvas.width = gameCanvas.width;
  fxCanvas.height = gameCanvas.height;
  setBufSize({ w: gameCanvas.width, h: gameCanvas.height });
};

export { syncFxCanvasSize };
