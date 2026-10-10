/* @layer renderer-lib @kind logic */
const intervalPointAt = (points: readonly number[], index: number): number => {
  const point = points[index];
  if (point === undefined) throw new Error(`No interval point at index ${String(index)}`);
  return point;
};

export { intervalPointAt };
