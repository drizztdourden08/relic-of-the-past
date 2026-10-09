/* @layer renderer-components @kind logic */
import type { Point } from '../Hookshot.type';
import { DEG } from './hookshot-layout.constants';

const turnPoint = ([x, y]: Point, deg: number): Point => {
  const c = Math.cos(deg / DEG), s = Math.sin(deg / DEG);
  return [x * c - y * s, x * s + y * c];
};

export { turnPoint };
