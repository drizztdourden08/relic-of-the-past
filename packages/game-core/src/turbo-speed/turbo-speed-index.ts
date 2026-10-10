/* @layer shared-game @kind logic */
import { TURBO_SPEEDS } from './turbo-speed.constants';

const turboSpeedIndex = (speed: number): number => {
  let best = 0;
  let bestGap = Infinity;
  for (const [i, candidate] of TURBO_SPEEDS.entries()) {
    const gap = Math.abs(candidate - speed);
    if (gap < bestGap) {
      best = i;
      bestGap = gap;
    }
  }
  return best;
};

export { turboSpeedIndex };
