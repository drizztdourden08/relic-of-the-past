/* @layer shared-game @kind logic */
/**
 * The item cap on a jump. A family's name table (and its virtual id space)
 * carries jumps of 1 … maxJump only, so a plan may never ask for a bigger
 * one. minCountFor is the fewest jumps that cover a span under the cap;
 * capJumps re-splits a generated sequence so no jump exceeds it. A sequence
 * already under the cap comes back unchanged, so every plan that was legal
 * before stays byte-identical.
 */

const sumOf = (jumps: readonly number[]): number => jumps.reduce((sum, jump) => sum + jump, 0);

/** The fewest jumps that cover `span` when none may exceed `maxJump`; 0 for an empty span. */
const minCountFor = (span: number, maxJump: number): number =>
  (span <= 0 ? 0 : Math.max(1, Math.ceil(span / Math.max(1, maxJump))));

/** The smallest jump still under the cap, the nearest to `from` on ties; −1 when none. */
const smallestWithHeadroom = (jumps: readonly number[], maxJump: number, from: number): number => {
  let best = -1;
  for (let index = 0; index < jumps.length; index += 1) {
    if (jumps[index] >= maxJump) continue;
    const smaller = best === -1 || jumps[index] < jumps[best];
    const nearerTie = best !== -1 && jumps[index] === jumps[best] && Math.abs(index - from) < Math.abs(best - from);
    if (smaller || nearerTie) best = index;
  }
  return best;
};

/**
 * Moves the excess of every over-cap jump onto the smallest jump with
 * headroom (the nearest on ties), so the sum and the length are kept and
 * the shape drifts as little as possible. Needs at least
 * minCountFor(Σ, maxJump) jumps; throws otherwise, as scaleToSpan does.
 */
const capJumps = (jumps: readonly number[], maxJump: number): number[] => {
  const out = [...jumps];
  for (let index = 0; index < out.length; index += 1) {
    while (out[index] > maxJump) {
      const target = smallestWithHeadroom(out, maxJump, index);
      if (target === -1) {
        throw new Error(`capJumps: ${out.length} jumps of at most ${maxJump} cannot cover a span of ${sumOf(out)}`);
      }
      const moved = Math.min(out[index] - maxJump, maxJump - out[target]);
      out[index] -= moved;
      out[target] += moved;
    }
  }
  return out;
};

export { capJumps, minCountFor };
