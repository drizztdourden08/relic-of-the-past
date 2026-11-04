/* @layer shared-game @kind logic */
import { mulberry32 } from '@rotp/game-data';
import { hashSeed } from './hash-seed';
import type { Rng } from './rng.type';

const swapAt = <T>(list: T[], i: number, j: number): void => {
  const held = list.slice(i, i + 1);
  list.splice(i, 1, ...list.slice(j, j + 1));
  list.splice(j, 1, ...held);
};

const createRng = (seed: string): Rng => {
  const next = mulberry32(hashSeed(seed));

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
