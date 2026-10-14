/* @layer bridge-wasm @kind types */
type DeliverItemParams = {
  itemId: number;
  message?: string;
  source?: string;
  messageId?: number | (() => number);
  onComplete?: () => void;
  onGranted?: () => void;
};

export type { DeliverItemParams };
