/* @layer shared-game @kind logic */
/**
 * THE rule: proportions → exact ladder jumps summing to the span.
 *   1. scale the weights to the span;
 *   2. floor, then hand the missing units to the largest remainders (ties →
 *      the earliest jump);
 *   3. the last jump absorbs any residual (a float guard, a no-op by
 *      construction);
 *   4. every jump ≥ 1: a zero takes one unit from the largest jump (the
 *      nearest on ties), always possible because the caller clamped
 *      n ≤ span.
 * The preview, the pool builder and the receipt export all call this one
 * function on the same inputs, so they can never disagree.
 */

const scaleToSpan = (weights: readonly number[], span: number): number[] => {
  const n = weights.length;
  if (n === 0) return [];
  if (!Number.isInteger(span) || span < n) {
    throw new Error(`scaleToSpan: ${n} jumps cannot partition a span of ${span}`);
  }
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const raw = weights.map((weight) => (weight * span) / total);
  const jumps = raw.map(Math.floor);
  const byRemainder = raw
    .map((value, index) => [value - jumps[index], index] as const)
    .sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  const missing = span - jumps.reduce((sum, jump) => sum + jump, 0);
  for (let k = 0; k < missing; k += 1) jumps[byRemainder[k][1]] += 1;
  jumps[n - 1] += span - jumps.reduce((sum, jump) => sum + jump, 0);
  for (let zero = jumps.indexOf(0); zero !== -1; zero = jumps.indexOf(0)) {
    let big = 0;
    for (let index = 1; index < n; index += 1) {
      const larger = jumps[index] > jumps[big];
      const nearerTie = jumps[index] === jumps[big] && Math.abs(index - zero) < Math.abs(big - zero);
      if (larger || nearerTie) big = index;
    }
    jumps[big] -= 1;
    jumps[zero] += 1;
  }
  return jumps;
};

export { scaleToSpan };
