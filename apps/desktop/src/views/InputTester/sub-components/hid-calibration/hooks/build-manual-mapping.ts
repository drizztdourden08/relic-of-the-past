/* @layer renderer-components @kind logic */
import type { HidButtonMapping } from '../hid-calibration.type';
import { ANALOG_THRESHOLD_DELTA } from '../hid-calibration.constants';
import { hex, popcount } from '../hid-analysis';
import { ANALOG_MIN_CHANGED_BITS, ANALOG_THRESHOLD_FRACTION, FULL_BYTE_MASK } from '../hid-analysis/hid-analysis.constants';

const buildManualMapping = (byteIdx: number, currentVal: number, baseVal: number): { mapping: HidButtonMapping; result: string } => {
  const delta = Math.abs(currentVal - baseVal);
  const xor = currentVal ^ baseVal;
  if (delta >= ANALOG_THRESHOLD_DELTA && popcount(xor) > ANALOG_MIN_CHANGED_BITS) {
    const threshold = baseVal + Math.floor(delta / ANALOG_THRESHOLD_FRACTION);
    return {
      mapping: { byteIndex: byteIdx, bitMask: FULL_BYTE_MASK, threshold, restValue: baseVal },
      result: `byte[${byteIdx}] analog (rest=${baseVal}, threshold=${threshold}) (manual)`,
    };
  }
  const bitMask = xor !== 0 ? xor : FULL_BYTE_MASK;
  return { mapping: { byteIndex: byteIdx, bitMask }, result: `byte[${byteIdx}] & 0x${hex(bitMask)} (manual)` };
};

export { buildManualMapping };
