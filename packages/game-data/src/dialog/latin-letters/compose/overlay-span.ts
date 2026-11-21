/* @layer shared-game @kind logic */
import type { Point } from './compose.type';

const span = (from: number, to: number, y: number): Point[] => {
  const points: Point[] = [];
  for (let x = from; x <= to; x++) points.push([x, y]);
  return points;
};

export { span };
