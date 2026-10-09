/* @layer shared-asset-extraction @kind logic */
import type { RGBA } from './palette.type';

const snesToRgba = (color: number): RGBA => {
  const r = color & 0x1f;
  const g = (color >>> 5) & 0x1f;
  const b = (color >>> 10) & 0x1f;
  return [
    (r << 3) | (r >>> 2),
    (g << 3) | (g >>> 2),
    (b << 3) | (b >>> 2),
    255,
  ];
};

export { snesToRgba };
