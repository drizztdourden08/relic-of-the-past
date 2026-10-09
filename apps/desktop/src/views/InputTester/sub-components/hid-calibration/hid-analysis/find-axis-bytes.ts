/* @layer renderer-components @kind logic */
import { DEFAULT_AXIS_MIN_DELTA } from './hid-analysis.constants';
import type { AxisByteChange } from './hid-analysis.type';

const findAxisBytes = (bl: Uint8Array, s: Uint8Array, excluded: Set<number>, minDelta = DEFAULT_AXIS_MIN_DELTA) => {
  const out: AxisByteChange[] = [];
  for (let i = 0; i < Math.min(bl.length, s.length); i++) {
    if (excluded.has(i)) continue;
    if (Math.abs(s[i] - bl[i]) >= minDelta) {
      out.push({ byteIndex: i, baseVal: bl[i], sampleVal: s[i] });
    }
  }
  return out;
};

export { findAxisBytes };
