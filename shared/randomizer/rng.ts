/* @layer shared-game @kind logic */
/**
 * Seeded deterministic PRNG for the randomizer. A seed STRING hashes to a u32
 * (FNV-1a) which seeds a mulberry32 stream, so the same seed string produces the
 * same sequence forever, on every platform (all math is u32 via Math.imul).
 * The determinism contract is pinned by tests/randomizer/rng.test.ts.
 */

interface Rng {
  /** Next float in [0, 1). */
  next(): number;
  /** Uniform integer in [0, maxExclusive). */
  int(maxExclusive: number): number;
  /** Fisher-Yates shuffle: returns a NEW array, input untouched. */
  shuffle<T>(arr: readonly T[]): T[];
}

/** FNV-1a over the UTF-16 code units of the seed string → u32. */
const hashSeed = (seed: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

/** mulberry32 over the hashed seed. */
const createRng = (seed: string): Rng => {
  let state = hashSeed(seed);

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (maxExclusive: number): number => Math.floor(next() * maxExclusive);

  const shuffle = <T>(arr: readonly T[]): T[] => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = int(i + 1);
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  };

  return { next, int, shuffle };
};

export { createRng, hashSeed };
export type { Rng };
