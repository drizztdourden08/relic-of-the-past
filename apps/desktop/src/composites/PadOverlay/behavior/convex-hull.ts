/* @layer renderer-components @kind logic */
import type { Point } from '../PadOverlay.type';

const turn = (o: Point, a: Point, b: Point): number => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

const bends = (chain: readonly Point[], next: Point): boolean => {
  const before = chain.at(-2);
  const last = chain.at(-1);
  return before !== undefined && last !== undefined && turn(before, last, next) <= 0;
};

const halfHull = (points: readonly Point[]): Point[] => {
  const chain: Point[] = [];
  points.forEach((point) => {
    while (bends(chain, point)) chain.pop();
    chain.push(point);
  });
  chain.pop();
  return chain;
};

const convexHull = (points: readonly Point[]): Point[] => {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (sorted.length < 3) return sorted;
  return [...halfHull(sorted), ...halfHull([...sorted].reverse())];
};

export { convexHull };
