/* @layer renderer-components @kind logic */
import type { Point } from '../Hookshot.type';

const pointAt = (line: readonly Point[], index: number): Point => {
  const point = line[index];
  if (point === undefined) throw new Error(`The hookshot line has no point ${index}`);
  return point;
};

export { pointAt };
