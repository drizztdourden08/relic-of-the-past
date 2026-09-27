/* @layer renderer-hud @kind logic */
/**
 * Paints a grid of palette indices into a canvas whose backing store is the grid itself, one canvas
 * pixel per game pixel. The browser scales it up with no smoothing, so every cell stays a hard square
 * at any HUD scale. The colours come from the custom properties HudPixelPie.css sets from the tokens.
 */
import { INK } from '../HudPixelPie.constants';
import type { PiePalette } from '../HudPixelPie.type';

/** Custom property per palette index. Index 0 is clear and has none. */
const INK_PROPERTIES: Record<number, string> = {
  [INK.outline]: '--hud-pixel-pie-outline',
  [INK.backing]: '--hud-pixel-pie-backing',
  [INK.deep]: '--hud-pixel-pie-deep',
  [INK.shade]: '--hud-pixel-pie-shade',
  [INK.lit]: '--hud-pixel-pie-lit',
  [INK.bright]: '--hud-pixel-pie-bright',
};

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
