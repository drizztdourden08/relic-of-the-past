/* @layer renderer-components @kind logic */
import type { ButtonDiff, HidButtonMapping } from '../hid-calibration.type';
import { ANALOG_THRESHOLD_FRACTION, FULL_BYTE_MASK } from './hid-analysis.constants';

const buildButtonMapping = (best: ButtonDiff): HidButtonMapping => {
  if (best.analog) {
    const threshold = best.restValue + Math.floor(Math.abs(best.pressedValue - best.restValue) / ANALOG_THRESHOLD_FRACTION);
    return { byteIndex: best.byteIndex, bitMask: FULL_BYTE_MASK, threshold, restValue: best.restValue };
  }
  return { byteIndex: best.byteIndex, bitMask: best.bitMask };
};

export { buildButtonMapping };
