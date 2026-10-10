/* @layer shared-game @kind logic */
import { TURBO_SPEEDS } from './turbo-speed.constants';

const turboSpeedAt = (index: number): number => {
  const clamped = Math.min(TURBO_SPEEDS.length - 1, Math.max(0, Math.round(index)));
  const speed = TURBO_SPEEDS[clamped];
  if (speed === undefined) throw new Error(`No turbo speed at index ${String(clamped)}`);
  return speed;
};

export { turboSpeedAt };
