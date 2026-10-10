/* @layer renderer-components @kind logic */
import { RAMP } from './ramp-color.constants';
import type { RampStop } from './ramp-color.type';

const lerp = (a: number, b: number, t: number): number => Math.round(a + (b - a) * t);

const mix = (lo: RampStop, hi: RampStop, t: number): string => {
  const [lr, lg, lb] = lo.rgb;
  const [hr, hg, hb] = hi.rgb;
  return `rgb(${lerp(lr, hr, t)}, ${lerp(lg, hg, t)}, ${lerp(lb, hb, t)})`;
};

const rampColor = (magnitude: number): string => {
  const [first, ...rest] = RAMP;
  let lo = first;
  for (const [i, hi] of rest.entries()) {
    if (magnitude > hi.at && i < rest.length - 1) { lo = hi; continue; }
    const t = hi.at === lo.at ? 0 : (magnitude - lo.at) / (hi.at - lo.at);
    return mix(lo, hi, Math.min(1, Math.max(0, t)));
  }
  return `rgb(${first.rgb.join(', ')})`;
};

export { rampColor };
