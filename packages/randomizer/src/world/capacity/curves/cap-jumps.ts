/* @layer shared-game @kind logic */
import { addAt, itemAt } from '../../../checked-access';
import { sumOfJumps } from './sum-of-jumps';

const smallestWithHeadroom = (jumps: readonly number[], maxJump: number, from: number): number => {
  let best = -1;
  let bestValue = 0;
  for (const [index, value] of jumps.entries()) {
    if (value >= maxJump) continue;
    const smaller = best === -1 || value < bestValue;
    const nearerTie = best !== -1 && value === bestValue && Math.abs(index - from) < Math.abs(best - from);
    if (smaller || nearerTie) {
      best = index;
      bestValue = value;
    }
  }
  return best;
};

const capJumps = (jumps: readonly number[], maxJump: number): number[] => {
  const out = [...jumps];
  for (let index = 0; index < out.length; index += 1) {
    while (itemAt(out, index) > maxJump) {
      const target = smallestWithHeadroom(out, maxJump, index);
      if (target === -1) {
        throw new Error(`capJumps: ${out.length} jumps of at most ${maxJump} cannot cover a span of ${sumOfJumps(out)}`);
      }
      const moved = Math.min(itemAt(out, index) - maxJump, maxJump - itemAt(out, target));
      addAt(out, index, -moved);
      addAt(out, target, moved);
    }
  }
  return out;
};

export { capJumps };
