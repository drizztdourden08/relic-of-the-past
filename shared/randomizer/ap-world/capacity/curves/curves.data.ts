/* @layer shared-game @kind data */
/**
 * The curve registry: pure proportion generators. A curve is (n) => n
 * weights, every one > 0; it knows nothing about a ladder, a span or
 * rounding. scale-to-span.ts turns any of them into exact ladder jumps, so
 * adding a curve is one entry here and no branch anywhere else.
 */
import type { CurveId } from '../capacity-profile.type';

type Proportions = (n: number) => readonly number[];

const fib = (n: number): number[] => {
  const sequence = [1, 1];
  while (sequence.length < n) {
    sequence.push(sequence[sequence.length - 1] + sequence[sequence.length - 2]);
  }
  return sequence.slice(0, n);
};

const CURVES: Readonly<Record<CurveId, Proportions>> = {
  equal: (n) => Array<number>(n).fill(1),
  // Big first, then two shrinking plateaus: 6 · 2 2 2 · 1 1 1 at n = 7.
  front: (n) => {
    const rest = n - 1;
    const mid = Math.ceil(rest / 2);
    return [6, ...Array<number>(mid).fill(2), ...Array<number>(rest - mid).fill(1)];
  },
  // 1 1 2 3 5 8 ... small first, growing.
  ramp: (n) => fib(n),
  // ... 8 5 3 2 1 1 largest first.
  'reverse-fib': (n) => fib(n).reverse(),
  // 1 2 4 8 ... each jump doubles ("Halves").
  geometric: (n) => Array.from({ length: n }, (_, index) => 2 ** index),
};

const CURVE_IDS: readonly CurveId[] = ['equal', 'front', 'ramp', 'reverse-fib', 'geometric'];

const CURVE_LABELS: Readonly<Record<CurveId | 'free', string>> = {
  equal: 'Equal',
  front: 'Front-loaded',
  ramp: 'Ramp',
  'reverse-fib': 'Reverse Fibonacci',
  geometric: 'Halves',
  free: 'Free sequence',
};

export { CURVE_IDS, CURVE_LABELS, CURVES };
export type { Proportions };
