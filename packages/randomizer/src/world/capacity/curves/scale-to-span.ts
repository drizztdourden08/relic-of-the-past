/* @layer shared-game @kind logic */
import { addAt, itemAt } from '../../../checked-access';

const largestNear = (jumps: readonly number[], zero: number): number => {
  let big = 0;
  let bigValue = itemAt(jumps, 0);
  for (const [index, value] of jumps.entries()) {
    const larger = value > bigValue;
    const nearerTie = value === bigValue && Math.abs(index - zero) < Math.abs(big - zero);
    if (larger || nearerTie) {
      big = index;
      bigValue = value;
    }
  }
  return big;
};

const sum = (values: readonly number[]): number => values.reduce((total, value) => total + value, 0);

const scaleToSpan = (weights: readonly number[], span: number): number[] => {
  const n = weights.length;
  if (n === 0) return [];
  if (!Number.isInteger(span) || span < n) {
    throw new Error(`scaleToSpan: ${n} jumps cannot partition a span of ${span}`);
  }
  const total = sum(weights);
  const raw = weights.map((weight) => (weight * span) / total);
  const jumps = raw.map(Math.floor);
  const byRemainder = raw
    .map((value, index) => [value - Math.floor(value), index] as const)
    .sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  const missing = span - sum(jumps);
  for (let k = 0; k < missing; k += 1) addAt(jumps, itemAt(byRemainder, k)[1], 1);
  addAt(jumps, n - 1, span - sum(jumps));
  for (let zero = jumps.indexOf(0); zero !== -1; zero = jumps.indexOf(0)) {
    addAt(jumps, largestNear(jumps, zero), -1);
    addAt(jumps, zero, 1);
  }
  return jumps;
};

export { scaleToSpan };
