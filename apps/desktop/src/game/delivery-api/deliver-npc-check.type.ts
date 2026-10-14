/* @layer bridge-wasm @kind types */
type DeliverNpcCheckParams = {
  flagType: number;
  flagMask: number;
  itemId: number;
  spriteType: number;
  postGfx: number;
  message?: string;
  source?: string;
  messageId?: number;
};

export type { DeliverNpcCheckParams };
