/* @layer renderer-components @kind types */
import type { InputItem } from './hid-calibration.type';

interface ComputeByteStatusesArgs {
  len: number;
  excluded: Set<number>;
  capturedStickBytes: Set<number>;
  capturedTriggerBytes: Set<number>;
  items: InputItem[];
}

export type { ComputeByteStatusesArgs };
