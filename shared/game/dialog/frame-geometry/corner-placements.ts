/* @layer shared-game @kind logic */
import type { CornerPlacement } from './frame-geometry.type';

const cornerPlacements = (w: number, h: number, pad: number): CornerPlacement[] => [
  { x: pad, y: pad, sx: 1, sy: 1 },
  { x: w - pad, y: pad, sx: -1, sy: 1 },
  { x: pad, y: h - pad, sx: 1, sy: -1 },
  { x: w - pad, y: h - pad, sx: -1, sy: -1 },
];

export { cornerPlacements };
