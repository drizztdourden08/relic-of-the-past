/* @layer bridge-wasm @kind types */
type DeliverCheckParams = {
  roomId: number;
  chestIndex: number;
  itemId: number;
  message?: string;
  source?: string;
};

export type { DeliverCheckParams };
