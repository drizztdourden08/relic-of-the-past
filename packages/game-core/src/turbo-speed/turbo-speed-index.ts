/* @layer shared-game @kind logic */
import { TURBO_SPEEDS } from './turbo-speed.constants';

const turboSpeedIndex = (speed: number): number => {
  let best = 0;
  for (let i = 1; i < TURBO_SPEEDS.length; i++) {
    if (Math.abs(TURBO_SPEEDS[i] - speed) < Math.abs(TURBO_SPEEDS[best] - speed)) best = i;
  }
  return best;
};

export { turboSpeedIndex };
