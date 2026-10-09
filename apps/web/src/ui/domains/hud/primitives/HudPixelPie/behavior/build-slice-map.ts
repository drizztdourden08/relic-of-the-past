/* @layer renderer-hud @kind logic */
import { FULL_TURN, GAP_HALF, HUB_RADIUS, MAX_PUSH, RIM_WIDTH, RING_WIDTH } from '../HudPixelPie.constants';
import type { SliceMap } from '../HudPixelPie.type';

const snap = (value: number): number => Math.round(value * 1e6) / 1e6;

const distanceToRay = (px: number, py: number, angle: number): number => {
  const along = px * Math.sin(angle) - py * Math.cos(angle);
  return along > 0 ? snap(px * Math.cos(angle) + py * Math.sin(angle)) : Number.NaN;
};

const inGap = (px: number, py: number, index: number, step: number): boolean =>
  distanceToRay(px, py, index * step) < GAP_HALF || distanceToRay(px, py, (index + 1) * step) >= -GAP_HALF;

const buildSliceMap = (gridSize: number, sliceCount: number): SliceMap => {
  const count = Math.max(1, Math.floor(sliceCount));
  const step = FULL_TURN / count;
  const centre = Math.floor(gridSize / 2);
  const discRadius = centre - MAX_PUSH;
  const sliceRadius = discRadius - RING_WIDTH;
  const cells = gridSize * gridSize;
  const map: SliceMap = {
    gridSize, sliceCount: count,
    owner: new Int8Array(cells).fill(-1), outline: new Uint8Array(cells),
    backing: new Uint8Array(cells), rim: new Uint8Array(cells), hub: new Uint8Array(cells),
  };

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const cell = y * gridSize + x;
      const px = x - centre;
      const py = y - centre;
      const radius = Math.hypot(px, py);
      if (radius >= discRadius) continue;
      if (radius >= discRadius - 1) { map.outline[cell] = 1; continue; }
      const angle = (Math.atan2(px, -py) + FULL_TURN) % FULL_TURN;
      const index = Math.min(count - 1, Math.floor(angle / step));
      const isSlice = radius < sliceRadius && (count === 1 || !inGap(px, py, index, step));
      if (!isSlice) { map.backing[cell] = 1; continue; }
      map.owner[cell] = index;
      if (radius < HUB_RADIUS) { map.hub[cell] = 1; continue; }
      if (radius >= sliceRadius - RIM_WIDTH && px + py > 0) map.rim[cell] = 1;
    }
  }
  return map;
};

export { buildSliceMap };
