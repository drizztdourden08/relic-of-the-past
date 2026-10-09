/* @layer renderer-components @kind logic */
import type { HidButtonMapping } from '../hid-calibration.type';

const describeButtonMapping = (m: HidButtonMapping): string =>
  m.threshold != null
    ? `byte[${m.byteIndex}] analog (rest=${m.restValue}, threshold=${m.threshold})`
    : `byte[${m.byteIndex}] & 0x${m.bitMask.toString(16).padStart(2, '0')}`;

export { describeButtonMapping };
