/* @layer renderer-components @kind types */
import type { TriggerKind } from '../hid-calibration.type';

interface TriggerClassification {
  kind: TriggerKind;
  uniqueCount: number;
  bitMask: number;
}

export type { TriggerClassification };
