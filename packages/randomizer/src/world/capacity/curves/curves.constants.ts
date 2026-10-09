/* @layer shared-game @kind constants */
import { fibonacci } from './fibonacci';
import type { CurveId } from '../capacity-profile.type';
import type { Proportions } from './curves.type';

const CURVES: Readonly<Record<CurveId, Proportions>> = {
  equal: (n) => Array<number>(n).fill(1),
  front: (n) => {
    const rest = n - 1;
    const mid = Math.ceil(rest / 2);
    return [6, ...Array<number>(mid).fill(2), ...Array<number>(rest - mid).fill(1)];
  },
  ramp: (n) => fibonacci(n),
  'reverse-fib': (n) => fibonacci(n).reverse(),
  geometric: (n) => Array.from({ length: n }, (_, index) => 2 ** index),
};

export { CURVES };
