/* @layer renderer-components @kind logic */
import type { Axis, Scene, Span } from './placement.type';

const otherAxis = (axis: Axis): Axis => (axis === 'x' ? 'y' : 'x');

const valuesIn = (scene: Scene, across: Axis, from: number, to: number): number[] => {
  const along = otherAxis(across);
  const values: number[] = [];
  scene.hullEdges.forEach(([a, b]) => {
    if (a[across] >= from && a[across] <= to) values.push(a[along]);
    for (const line of [from, to]) {
      if ((a[across] - line) * (b[across] - line) < 0) {
        values.push(a[along] + ((line - a[across]) / (b[across] - a[across])) * (b[along] - a[along]));
      }
    }
  });
  return values;
};

const hullSpan = (scene: Scene, across: Axis, from: number, to: number): Span | null => {
  const key = `${across}|${Math.floor(from)}|${Math.ceil(to)}`;
  const cached = scene.spans.get(key);
  if (cached !== undefined) return cached;
  const values = valuesIn(scene, across, Math.floor(from), Math.ceil(to));
  const span = values.length === 0 ? null : { low: Math.min(...values), high: Math.max(...values) };
  scene.spans.set(key, span);
  return span;
};

export { hullSpan };
