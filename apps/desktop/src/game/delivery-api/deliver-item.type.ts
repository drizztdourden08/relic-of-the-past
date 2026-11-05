/* @layer bridge-wasm @kind types */
import type { DeliverySink } from './delivery-sink.type';

type DeliverItemParams = {
  itemId: number;
  message?: string;
  source?: string;
  messageId?: number | (() => number);
  onComplete?: () => void;
  onGranted?: () => void;
  sink?: DeliverySink;
};

export type { DeliverItemParams };
