/* @layer renderer-hud @kind logic */
import type { SeededRandom } from './scene.type';

const seededRandom = (seed: number): SeededRandom => {
  let state = seed >>> 0 || 1;
  const next = (): number => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  return {
    next,
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    range: (lo, hi) => lo + next() * (hi - lo),
    chance: (p) => next() < p,
  };
};

export { seededRandom };
