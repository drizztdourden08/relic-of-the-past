/* @layer renderer-hud @kind logic */
import { INK, INK_PROPERTIES } from '../HudPixelPie.constants';
import type { PiePalette } from '../HudPixelPie.type';

const readPalette = (canvas: HTMLCanvasElement): PiePalette => {
  const style = getComputedStyle(canvas);
  const palette: string[] = [''];
  Object.entries(INK_PROPERTIES).forEach(([index, property]) => {
    palette[Number(index)] = style.getPropertyValue(property).trim();
  });
  return palette;
};

const paintGrid = (canvas: HTMLCanvasElement, grid: Uint8Array, gridSize: number): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const palette = readPalette(canvas);
  ctx.clearRect(0, 0, gridSize, gridSize);
  let current = INK.clear as number;
  grid.forEach((ink, cell) => {
    if (ink === INK.clear || !palette[ink]) return;
    if (ink !== current) {
      ctx.fillStyle = palette[ink];
      current = ink;
    }
    ctx.fillRect(cell % gridSize, Math.floor(cell / gridSize), 1, 1);
  });
};

export { paintGrid };
