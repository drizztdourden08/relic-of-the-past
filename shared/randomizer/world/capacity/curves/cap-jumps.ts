/* @layer shared-game @kind logic */
import { sumOfJumps } from './sum-of-jumps';

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

const capJumps = (jumps: readonly number[], maxJump: number): number[] => {
  const out = [...jumps];
  for (let index = 0; index < out.length; index += 1) {
    while (out[index] > maxJump) {
      const target = smallestWithHeadroom(out, maxJump, index);
      if (target === -1) {
        throw new Error(`capJumps: ${out.length} jumps of at most ${maxJump} cannot cover a span of ${sumOfJumps(out)}`);
      }
      const moved = Math.min(out[index] - maxJump, maxJump - out[target]);
      out[index] -= moved;
      out[target] += moved;
    }
  }
  return out;
};

export { capJumps };
