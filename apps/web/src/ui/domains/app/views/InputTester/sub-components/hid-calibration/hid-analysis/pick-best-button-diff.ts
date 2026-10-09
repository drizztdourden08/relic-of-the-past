/* @layer renderer-components @kind logic */
import type { ButtonDiff } from '../hid-calibration.type';
import { popcount } from './popcount';

const pickBestButtonDiff = (diffs: ButtonDiff[]): ButtonDiff => {
  const digital = diffs.filter(d => !d.analog);
  const analog = diffs.filter(d => d.analog);
  if (digital.length > 0) {
    let best = digital[0];
    for (const d of digital) { if (popcount(d.bitMask) < popcount(best.bitMask)) best = d; }
    return best;
  }
  let best = analog[0];
  for (const d of analog) { if (Math.abs(d.pressedValue - d.restValue) > Math.abs(best.pressedValue - best.restValue)) best = d; }
  return best;
};

export { pickBestButtonDiff };
