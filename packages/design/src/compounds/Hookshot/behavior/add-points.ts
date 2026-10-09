/* @layer renderer-components @kind logic */
import type { Point } from '../Hookshot.type';

const addPoints = (a: Point, b: Point): Point => [a[0] + b[0], a[1] + b[1]];

export { addPoints };
