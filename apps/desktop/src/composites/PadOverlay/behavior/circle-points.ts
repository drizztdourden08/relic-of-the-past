/* @layer renderer-components @kind logic */
import { HULL_SAMPLES } from '../PadOverlay.constants';
import type { Point } from '../PadOverlay.type';
import type { Circle } from './placement.type';

const circlePoints = (circle: Circle): Point[] =>
  Array.from({ length: HULL_SAMPLES }, (_, step) => {
    const angle = (step / HULL_SAMPLES) * Math.PI * 2;
    return { x: circle.x + Math.cos(angle) * circle.r, y: circle.y + Math.sin(angle) * circle.r };
  });

export { circlePoints };
