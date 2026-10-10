/* @layer bridge-wasm @kind logic */
import type { LightSource } from '../shadow-casting-types';
import type { Rgb } from './light-calculator.type';

const white = (): Rgb => [1, 1, 1];

const sampleGameColor = (x: number, y: number, canvas: HTMLCanvasElement | null): Rgb => {
  if (!canvas) return white();

  try {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return white();

    const px = Math.round(x);
    const py = Math.round(y);
    if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) return white();

    const pixel = ctx.getImageData(px, py, 1, 1).data;
    return [(pixel[0] ?? 0) / 255, (pixel[1] ?? 0) / 255, (pixel[2] ?? 0) / 255];
  } catch {
    return white();
  }
};

const parseHexColor = (hex: string): Rgb => {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return white();
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
};

const resolveLightColor = (light: LightSource, gameCanvas: HTMLCanvasElement | null): Rgb => {
  if (light.color === 'sample') {
    return sampleGameColor(light.x, light.y, gameCanvas);
  }
  return parseHexColor(light.color);
};

export { resolveLightColor };
