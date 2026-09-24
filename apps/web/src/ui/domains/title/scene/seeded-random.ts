/* @layer renderer-hud @kind logic */
/** A small seeded generator, so a scene layout is reproducible for its seed. */

interface SeededRandom {
  /** Uniform in [0, 1). */
  next: () => number;
  /** Uniform integer in [lo, hi]. */
  int: (lo: number, hi: number) => number;
  /** Uniform in [lo, hi). */
  range: (lo: number, hi: number) => number;
  chance: (p: number) => boolean;
}

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
export type { SeededRandom };
