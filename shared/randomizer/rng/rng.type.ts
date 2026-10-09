/* @layer shared-game @kind types */

interface Rng {
  next(): number;
  int(maxExclusive: number): number;
  shuffle<T>(arr: readonly T[]): T[];
}

export type { Rng };
