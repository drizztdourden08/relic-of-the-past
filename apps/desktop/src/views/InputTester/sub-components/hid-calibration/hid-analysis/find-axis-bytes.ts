/* @layer renderer-components @kind logic */
import { DEFAULT_AXIS_MIN_DELTA } from './hid-analysis.constants';
import type { AxisByteChange } from './hid-analysis.type';

const findAxisBytes = (bl: Uint8Array, s: Uint8Array, excluded: Set<number>, minDelta = DEFAULT_AXIS_MIN_DELTA) => {
  const out: AxisByteChange[] = [];
  for (let i = 0; i < Math.min(bl.length, s.length); i++) {
    const baseVal = bl[i];
    const sampleVal = s[i];
    if (excluded.has(i) || baseVal === undefined || sampleVal === undefined) continue;
    if (Math.abs(sampleVal - baseVal) >= minDelta) out.push({ byteIndex: i, baseVal, sampleVal });
  }
  return out;
};

export { findAxisBytes };
