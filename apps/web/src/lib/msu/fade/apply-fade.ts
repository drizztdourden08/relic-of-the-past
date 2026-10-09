/* @layer renderer-lib @kind logic */
import { MIN_RAMP_SECONDS, TRANSITIONS } from './fade.constants';
import { rampSeconds } from './ramp-seconds';

const applyFade = (gain: GainNode, now: number, ctrl: number): number => {
  const transition = TRANSITIONS[ctrl];
  if (!transition) return gain.gain.value;
  const target = transition.target / 255;
  const seconds = rampSeconds(gain.gain.value, target, transition.step);
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(target, now + Math.max(MIN_RAMP_SECONDS, seconds));
  return target;
};

export { applyFade };
