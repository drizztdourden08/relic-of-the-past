/* @layer renderer-components @kind logic */
import { RAMP } from './ramp-color.constants';

const lerp = (a: number, b: number, t: number): number => Math.round(a + (b - a) * t);

const rampColor = (magnitude: number): string => {
  for (let i = 1; i < RAMP.length; i++) {
    const hi = RAMP[i];
    if (magnitude > hi.at && i < RAMP.length - 1) continue;
    const lo = RAMP[i - 1];
    const t = hi.at === lo.at ? 0 : (magnitude - lo.at) / (hi.at - lo.at);
    const c = [0, 1, 2].map((k) => lerp(lo.rgb[k], hi.rgb[k], Math.min(1, Math.max(0, t))));
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  }
  return `rgb(${RAMP[0].rgb.join(', ')})`;
};

export { rampColor };
