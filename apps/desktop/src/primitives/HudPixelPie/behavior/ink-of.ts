/* @layer renderer-hud @kind logic */
import { INK } from '../HudPixelPie.constants';
import type { SliceMap } from '../HudPixelPie.type';

const rimOf = (body: number): number => Math.max(INK.shade, body - 1);

const inkOf = (body: number, map: SliceMap, cell: number): number => {
  if (map.hub[cell] === 1) return INK.deep;
  return map.rim[cell] === 1 ? rimOf(body) : body;
};

export { inkOf };
