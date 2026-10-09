/* @layer renderer-lib @kind logic */
import { FULL_STEP, MIN_RAMP_SECONDS } from './fade.constants';
import { rampSeconds } from './ramp-seconds';

const restoreFull = (gain: GainNode, now: number): void => {
  const seconds = rampSeconds(gain.gain.value, 1, FULL_STEP);
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(1, now + Math.max(MIN_RAMP_SECONDS, seconds));
};

export { restoreFull };
