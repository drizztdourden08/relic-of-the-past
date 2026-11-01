/* @layer renderer-components @kind logic */
import type { GridPos } from '../navigation-overlay.type';
import { manhattan } from './manhattan';
import { popLowest } from './pop-lowest';

const createFrontier = <N extends GridPos>(start: N, goal: GridPos, keyOf: (node: N) => string) => {
  const startKey = keyOf(start);
  const open: N[] = [start];
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[startKey, 0]]);
  const fScore = new Map<string, number>([[startKey, manhattan(start, goal)]]);
  const closed = new Set<string>();

  const relax = (currentKey: string, next: N, stepCost: number): void => {
    const nextKey = keyOf(next);
    if (closed.has(nextKey)) return;
    const tentativeG = (gScore.get(currentKey) ?? Number.POSITIVE_INFINITY) + stepCost;
    if (tentativeG >= (gScore.get(nextKey) ?? Number.POSITIVE_INFINITY)) return;
    cameFrom.set(nextKey, currentKey);
    gScore.set(nextKey, tentativeG);
    fScore.set(nextKey, tentativeG + manhattan(next, goal));
    if (!open.some((node) => keyOf(node) === nextKey)) open.push(next);
  };

  const scoreOf = (node: N): number => fScore.get(keyOf(node)) ?? Number.POSITIVE_INFINITY;

  const takeLowest = (): N | undefined => popLowest(open, scoreOf);
  const close = (key: string): void => { closed.add(key); };

  return { cameFrom, relax, takeLowest, close };
};

export { createFrontier };
