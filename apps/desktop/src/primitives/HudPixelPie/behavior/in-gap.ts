/* @layer renderer-hud @kind logic */
import { GAP_HALF } from '../HudPixelPie.constants';

const snap = (value: number): number => Math.round(value * 1e6) / 1e6;

const distanceToRay = (px: number, py: number, angle: number): number => {
  const along = px * Math.sin(angle) - py * Math.cos(angle);
  return along > 0 ? snap(px * Math.cos(angle) + py * Math.sin(angle)) : Number.NaN;
};

const inGap = (px: number, py: number, index: number, step: number): boolean =>
  distanceToRay(px, py, index * step) < GAP_HALF || distanceToRay(px, py, (index + 1) * step) >= -GAP_HALF;

export { inGap };
