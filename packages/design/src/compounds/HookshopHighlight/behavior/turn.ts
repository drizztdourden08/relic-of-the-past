/* @layer renderer-components @kind logic */
import type { Point } from '../HookshopHighlight.type';

const rad = (deg: number) => (deg * Math.PI) / 180;

const turn = ([x, y]: Point, [cx, cy]: Point, deg: number): Point => {
  const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
  return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
};

export { turn };
