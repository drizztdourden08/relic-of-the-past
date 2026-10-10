/* @layer shared-game @kind logic */
import { hashSeed } from './hash-seed';
import type { Rng } from './rng.type';

const swapAt = <T>(list: T[], i: number, j: number): void => {
  const held = list.slice(i, i + 1);
  list.splice(i, 1, ...list.slice(j, j + 1));
  list.splice(j, 1, ...held);
};

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
      swapAt(out, i, j);
    }
    return out;
  };

  return { next, int, shuffle };
};

export { createRng };
