/* @layer shared-game @kind data */
import type { CurveId } from '../capacity-profile.type';

const CURVE_IDS: readonly CurveId[] = ['equal', 'front', 'ramp', 'reverse-fib', 'geometric'];

const CURVE_LABELS: Readonly<Record<CurveId | 'free', string>> = {
  equal: 'Equal',
  front: 'Front-loaded',
  ramp: 'Ramp',
  'reverse-fib': 'Reverse Fibonacci',
  geometric: 'Halves',
  free: 'Free sequence',
};

export { CURVE_IDS, CURVE_LABELS };
