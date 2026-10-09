/* @layer renderer-components @kind logic */
import type { ButtonDiff } from '../hid-calibration.type';
import { ANALOG_THRESHOLD_DELTA } from '../hid-calibration.constants';
import { ANALOG_MIN_CHANGED_BITS } from './hid-analysis.constants';
import { popcount } from './popcount';

const findButtonBits = (bl: Uint8Array, pressed: Uint8Array, excluded: Set<number>): ButtonDiff[] => {
  const out: ButtonDiff[] = [];
  for (let i = 0; i < Math.min(bl.length, pressed.length); i++) {
    const restValue = bl[i];
    const pressedValue = pressed[i];
    if (excluded.has(i) || restValue === undefined || pressedValue === undefined) continue;
    const xor = restValue ^ pressedValue;
    if (!xor) continue;
    const delta = Math.abs(pressedValue - restValue);
    const isAnalog = delta >= ANALOG_THRESHOLD_DELTA && popcount(xor) > ANALOG_MIN_CHANGED_BITS;
    out.push({ byteIndex: i, bitMask: xor, analog: isAnalog, restValue, pressedValue });
  }
  return out;
};

export { findButtonBits };
