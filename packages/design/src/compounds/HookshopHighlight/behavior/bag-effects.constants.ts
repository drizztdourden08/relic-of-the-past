/* @layer renderer-components @kind constants */
import type { Point } from '../HookshopHighlight.type';

const STARS: Point[] = [[81, 15], [64, 102]];
const SPEED_LINES: { from: Point; spread: number }[] = [
  { from: [73.5, 36], spread: -13 },
  { from: [78, 57], spread: -9 },
  { from: [80, 80], spread: -1 },
];

export { SPEED_LINES, STARS };
