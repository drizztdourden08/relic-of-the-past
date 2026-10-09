/* @layer renderer-components @kind logic */
import { HOOKSHOT_PARTS } from '../Hookshot.constants';
import type { HookshotCurve, Point } from '../Hookshot.type';
import { addPoints } from './add-points';
import { turnPoint } from './turn-point';

const hookshotCurve = (grip: Point, angle: number, length: number, bend: number): HookshotCurve => {
  const { grip: g, muzzle: m } = HOOKSHOT_PARTS.handle;
  const start = addPoints(grip, turnPoint([m[0] - g[0], m[1] - g[1]], angle));
  const end = addPoints(start, turnPoint([length, 0], angle + bend / 2));
  return [start, addPoints(start, turnPoint([length / 3, 0], angle)), addPoints(end, turnPoint([-length / 3, 0], angle + bend)), end];
};

export { hookshotCurve };
