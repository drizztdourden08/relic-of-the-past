/* @layer shared-game @kind logic */
import { TURBO_SPEEDS } from './turbo-speed.constants';

const turboSpeedAt = (index: number): number => {
  const clamped = Math.min(TURBO_SPEEDS.length - 1, Math.max(0, Math.round(index)));
  return TURBO_SPEEDS[clamped];
};

export { turboSpeedAt };
