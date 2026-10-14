/* @layer renderer-hud @kind logic */
import { FULL_TURN, HUB_RADIUS, RIM_WIDTH } from '../HudPixelPie.constants';
import type { SliceCell, SliceGeometry, SliceMap } from '../HudPixelPie.type';
import { inGap } from './in-gap';

const markSliceCell = (map: SliceMap, geometry: SliceGeometry, at: SliceCell): void => {
  const { count, step, discRadius, sliceRadius } = geometry;
  const { cell, px, py } = at;
  const radius = Math.hypot(px, py);
  if (radius >= discRadius) return;
  if (radius >= discRadius - 1) { map.outline[cell] = 1; return; }
  const angle = (Math.atan2(px, -py) + FULL_TURN) % FULL_TURN;
  const index = Math.min(count - 1, Math.floor(angle / step));
  const isSlice = radius < sliceRadius && (count === 1 || !inGap(px, py, index, step));
  if (!isSlice) { map.backing[cell] = 1; return; }
  map.owner[cell] = index;
  if (radius < HUB_RADIUS) { map.hub[cell] = 1; return; }
  if (radius >= sliceRadius - RIM_WIDTH && px + py > 0) map.rim[cell] = 1;
};

export { markSliceCell };
